import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { rfid_uid, person_name, age, contact_no, total_visitor_members } =
      body;

    if (!rfid_uid || !person_name) {
      return NextResponse.json(
        { error: "rfid_uid and person_name are required" },
        { status: 400 },
      );
    }

    // check if card exists / its current status
    const { data: card, error: cardError } = await supabaseAdmin
      .from("rfid_cards")
      .select("rfid_uid, status")
      .eq("rfid_uid", rfid_uid)
      .maybeSingle();

    if (cardError) throw cardError;

    if (card && card.status === "assigned") {
      return NextResponse.json(
        { error: "Card already assigned. Reset before reassigning." },
        { status: 409 },
      );
    }

    // if card doesn't exist yet, create it; otherwise it's 'available' already
    if (!card) {
      const { error: insertCardError } = await supabaseAdmin
        .from("rfid_cards")
        .insert({ rfid_uid, status: "assigned" });
      if (insertCardError) throw insertCardError;
    } else {
      const { error: updateCardError } = await supabaseAdmin
        .from("rfid_cards")
        .update({ status: "assigned" })
        .eq("rfid_uid", rfid_uid);
      if (updateCardError) throw updateCardError;
    }

    // create the visitor record
    const { data: visitor, error: visitorError } = await supabaseAdmin
      .from("visitors")
      .insert({
        rfid_uid,
        person_name,
        age: age ?? null,
        contact_no: contact_no ?? null,
        total_visitor_members: total_visitor_members ?? 1,
        is_active: true,
      })
      .select()
      .single();

    if (visitorError) throw visitorError;

    return NextResponse.json({ success: true, visitor }, { status: 201 });
  } catch (err) {
    console.error("register error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
