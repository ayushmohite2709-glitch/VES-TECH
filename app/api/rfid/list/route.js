import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

const ONE_HOUR_MS = 60 * 60 * 1000;

export async function GET() {
  try {
    // all cards
    const { data: cards, error: cardsError } = await supabaseAdmin
      .from("rfid_cards")
      .select("rfid_uid, status");
    if (cardsError) throw cardsError;

    // all currently-active visitors
    const { data: visitors, error: visitorsError } = await supabaseAdmin
      .from("visitors")
      .select("*")
      .eq("is_active", true);
    if (visitorsError) throw visitorsError;

    // recent 50 scan logs, newest first
    const { data: logs, error: logsError } = await supabaseAdmin
      .from("scan_logs")
      .select("*")
      .order("scanned_at", { ascending: false })
      .limit(50);
    if (logsError) throw logsError;

    // merge: attach visitor + computed access to each card
    const visitorByUid = Object.fromEntries(
      visitors.map((v) => [v.rfid_uid, v]),
    );

    const merged = cards.map((card) => {
      const visitor = visitorByUid[card.rfid_uid];
      if (!visitor) {
        return { ...card, visitor: null, access: false };
      }
      const age_ms = Date.now() - new Date(visitor.created_at).getTime();
      const access = age_ms < ONE_HOUR_MS;
      return { ...card, visitor, access };
    });

    return NextResponse.json({ cards: merged, logs });
  } catch (err) {
    console.error("list error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
