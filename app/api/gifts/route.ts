import { NextResponse } from "next/server";
import { z } from "zod";
import { encodeGift } from "@/lib/gift-token";

const schema = z.object({
  recipientName: z.string().min(1).max(80),
  recipientPhone: z.string().max(30).optional(),
  amount: z.number().positive().max(1000),
  message: z.string().max(280),
  event: z.object({
    id: z.string(),
    sportKey: z.string(),
    league: z.string(),
    homeTeam: z.string(),
    awayTeam: z.string(),
    commenceTime: z.string(),
    bets: z.array(z.any())
  }),
  bet: z.object({
    market: z.enum(["h2h", "spreads", "totals"]),
    label: z.string(),
    selection: z.string(),
    odds: z.number(),
    point: z.number().optional(),
    bookmaker: z.string().optional()
  })
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid gift details" }, { status: 400 });
  }

  const payload = {
    ...parsed.data,
    createdAt: new Date().toISOString()
  };

  const token = encodeGift(payload);
  return NextResponse.json({
    token,
    giftUrl: `/gift/${token}`,
    mode: "demo",
    disclaimer: "No money moved and no wager was placed."
  });
}
