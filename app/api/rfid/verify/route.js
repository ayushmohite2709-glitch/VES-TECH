import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

const ONE_HOUR_MS = 60 * 60 * 1000;

export async function POST(request) {
  try {
    const { rfid_uid } = await request.json();

    if (!rfid_uid) {
      return NextResponse.json(
        { error: "rfid_uid is required" },
        { status: 400 },
      );
    }

    // find the active visitor for this card
    const { data: visitor, error: visitorError } = await supabaseAdmin
      .from("visitors")
      .select("*")
      .eq("rfid_uid", rfid_uid)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (visitorError) throw visitorError;

    let result;
    let responsePayload;

    if (!visitor) {
      result = "denied_unknown";
      responsePayload = { access: false, reason: "unknown_or_reset_card" };
    } else {
      const age_ms = Date.now() - new Date(visitor.created_at).getTime();
      const isValid = age_ms < ONE_HOUR_MS;

      if (isValid) {
        result = "allowed";
        responsePayload = {
          access: true,
          visitor: {
            person_name: visitor.person_name,
            total_visitor_members: visitor.total_visitor_members,
          },
        };
      } else {
        result = "denied_expired";
        responsePayload = { access: false, reason: "expired" };
      }
    }

    // always log the scan, regardless of outcome
    const { error: logError } = await supabaseAdmin.from("scan_logs").insert({
      rfid_uid,
      visitor_id: visitor ? visitor.visitor_id : null,
      result,
    });

    if (logError) console.error("scan_logs insert failed:", logError);

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (err) {
    console.error("verify error:", err);
    // ESP32 should treat any non-200 as "error" state, not "denied"
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
