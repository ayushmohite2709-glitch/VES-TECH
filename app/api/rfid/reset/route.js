import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const { rfid_uid } = await request.json();

    if (!rfid_uid) {
      return NextResponse.json(
        { error: "rfid_uid is required" },
        { status: 400 },
      );
    }

    // deactivate any active visitor tied to this card
    const { error: visitorError } = await supabaseAdmin
      .from("visitors")
      .update({ is_active: false })
      .eq("rfid_uid", rfid_uid)
      .eq("is_active", true);

    if (visitorError) throw visitorError;

    // free up the card
    const { error: cardError } = await supabaseAdmin
      .from("rfid_cards")
      .update({ status: "available" })
      .eq("rfid_uid", rfid_uid);

    if (cardError) throw cardError;

    // optional: log the reset as an event too
    await supabaseAdmin.from("scan_logs").insert({
      rfid_uid,
      visitor_id: null,
      result: "denied_reset",
    });

    return NextResponse.json({
      success: true,
      message: `Card ${rfid_uid} reset`,
    });
  } catch (err) {
    console.error("reset error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
