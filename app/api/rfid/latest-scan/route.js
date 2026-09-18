import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { data: log, error } = await supabaseAdmin
      .from("scan_logs")
      .select("rfid_uid, result, scanned_at")
      .order("scanned_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ log });
  } catch (err) {
    console.error("latest-scan error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
