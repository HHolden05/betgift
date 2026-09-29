import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

const schema = z.object({
  codes: z.array(z.string().min(4).max(32)).max(100)
});

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ gifts: [] });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid gift codes" }, { status: 400 });
  }

  const codes = Array.from(new Set(parsed.data.codes.map((code) => code.toUpperCase())));
  if (!codes.length) return NextResponse.json({ gifts: [] });

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("gifts")
    .select("code, recipient_name, recipient_email, amount, event_data, bet_data, status, email_status, created_at, opened_at, claimed_at")
    .in("code", codes)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gift history lookup failed", error);
    return NextResponse.json({ error: "Could not load gift history" }, { status: 503 });
  }

  return NextResponse.json({
    gifts: (data ?? []).map((row) => ({
      code: row.code,
      recipientName: row.recipient_name,
      recipientEmail: row.recipient_email,
      amount: Number(row.amount),
      event: row.event_data,
      bet: row.bet_data,
      status: row.status,
      emailStatus: row.email_status,
      createdAt: row.created_at,
      openedAt: row.opened_at,
      claimedAt: row.claimed_at
    }))
  });
}
