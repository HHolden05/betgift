import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

type GiftRow = {
  amount: number;
  event_data: { homeTeam?: string; awayTeam?: string } | null;
  bet_data: { selection?: string } | null;
  status: "created" | "opened" | "claimed";
  email_status: string | null;
  created_at: string;
};

function topEntries(map: Map<string, number>, limit = 5) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      totals: { gifts: 0, emailed: 0, deliveredEmail: 0, opened: 0, claimed: 0, averageAmount: 0 },
      rates: { emailDeliveryRate: 0, openRate: 0, claimRate: 0 },
      topTeams: [],
      topSelections: [],
      recentDaily: []
    });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("gifts")
    .select("amount,event_data,bet_data,status,email_status,created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Analytics query failed", error);
    return NextResponse.json({ error: "Could not load analytics" }, { status: 503 });
  }

  const rows = (data ?? []) as GiftRow[];
  const totalGifts = rows.length;
  const emailed = rows.filter((row) => row.email_status && row.email_status !== "not_requested").length;
  const deliveredEmail = rows.filter((row) => row.email_status === "sent").length;
  const opened = rows.filter((row) => row.status === "opened" || row.status === "claimed").length;
  const claimed = rows.filter((row) => row.status === "claimed").length;
  const totalAmount = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  const teamCounts = new Map<string, number>();
  const selectionCounts = new Map<string, number>();
  const dailyCounts = new Map<string, number>();

  for (const row of rows) {
    for (const team of [row.event_data?.awayTeam, row.event_data?.homeTeam]) {
      if (team) teamCounts.set(team, (teamCounts.get(team) ?? 0) + 1);
    }
    const selection = row.bet_data?.selection;
    if (selection) selectionCounts.set(selection, (selectionCounts.get(selection) ?? 0) + 1);

    const day = new Date(row.created_at).toISOString().slice(0, 10);
    dailyCounts.set(day, (dailyCounts.get(day) ?? 0) + 1);
  }

  return NextResponse.json({
    totals: {
      gifts: totalGifts,
      emailed,
      deliveredEmail,
      opened,
      claimed,
      averageAmount: totalGifts ? totalAmount / totalGifts : 0
    },
    rates: {
      emailDeliveryRate: emailed ? deliveredEmail / emailed : 0,
      openRate: totalGifts ? opened / totalGifts : 0,
      claimRate: totalGifts ? claimed / totalGifts : 0
    },
    topTeams: topEntries(teamCounts),
    topSelections: topEntries(selectionCounts),
    recentDaily: Array.from(dailyCounts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([date, count]) => ({ date, count }))
  });
}
