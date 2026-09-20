import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

const VALID_ROLES = ["visitor", "doctor", "staff"];
const MAX_VISITORS_AT_A_TIME = 4;
const VISITING_WINDOWS = [
  { startH: 10, startM: 0, endH: 14, endM: 0 },
  { startH: 16, startM: 0, endH: 18, endM: 0 },
];

function isWithinVisitingHours(startISO, endISO) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
  if (end <= start) return false;

  return VISITING_WINDOWS.some((w) => {
    const windowStart = new Date(start);
    windowStart.setHours(w.startH, w.startM, 0, 0);
    const windowEnd = new Date(start);
    windowEnd.setHours(w.endH, w.endM, 0, 0);
    return start >= windowStart && end <= windowEnd;
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      rfid_uid,
      assigned_id,
      role,
      person_name,
      age,
      contact_no,
      total_visitor_members,
      slot_start,
      slot_end,
    } = body;

    if (!rfid_uid || !person_name) {
      return NextResponse.json(
        { error: "rfid_uid and person_name are required" },
        { status: 400 },
      );
    }

    const normalizedRole = VALID_ROLES.includes(role) ? role : "visitor";
    const isDoctor = normalizedRole === "doctor";

    if (!assigned_id) {
      return NextResponse.json(
        { error: "assigned_id is required" },
        { status: 400 },
      );
    }

    if (!slot_start || !slot_end) {
      return NextResponse.json(
        { error: "slot_start and slot_end are required" },
        { status: 400 },
      );
    }

    if (!isWithinVisitingHours(slot_start, slot_end)) {
      return NextResponse.json(
        {
          error:
            "Time slot must be a 1-hour window fully inside visiting hours (10:00-14:00 or 16:00-18:00).",
        },
        { status: 400 },
      );
    }

    const visitorCount = isDoctor ? null : Number(total_visitor_members) || 1;

    if (!isDoctor && visitorCount > MAX_VISITORS_AT_A_TIME) {
      return NextResponse.json(
        { error: `Maximum ${MAX_VISITORS_AT_A_TIME} visitors are allowed at a time.` },
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
        .insert({ rfid_uid, status: "assigned", assigned_id, role: normalizedRole });
      if (insertCardError) throw insertCardError;
    } else {
      const { error: updateCardError } = await supabaseAdmin
        .from("rfid_cards")
        .update({ status: "assigned", assigned_id, role: normalizedRole })
        .eq("rfid_uid", rfid_uid);
      if (updateCardError) throw updateCardError;
    }

    // create the visitor record
    const { data: visitor, error: visitorError } = await supabaseAdmin
      .from("visitors")
      .insert({
        rfid_uid,
        assigned_id,
        role: normalizedRole,
        person_name,
        age: age ?? null,
        contact_no: contact_no ?? null,
        total_visitor_members: visitorCount,
        slot_start,
        slot_end,
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