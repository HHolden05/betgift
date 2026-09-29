import { NextResponse } from "next/server";
import { z } from "zod";
import { encodeGift } from "@/lib/gift-token";
import { createStoredGift, markGiftEmailStatus } from "@/lib/gifts-db";

const schema = z.object({
  recipientName: z.string().min(1).max(80),
  recipientPhone: z.string().max(30).optional(),
  recipientEmail: z.string().email().max(254).optional().or(z.literal("")),
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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendGiftEmail(args: {
  to: string;
  recipientName: string;
  amount: number;
  selection: string;
  message: string;
  giftUrl: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { status: "not_configured" as const };

  const from = process.env.BETGIFT_EMAIL_FROM || "BetGift <onboarding@resend.dev>";
  const safeName = escapeHtml(args.recipientName);
  const safeSelection = escapeHtml(args.selection);
  const safeMessage = escapeHtml(args.message);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [args.to],
      subject: `${args.recipientName}, you got a BetGift`,
      html: `
        <div style="font-family:Arial,sans-serif;background:#0b1510;color:#f5fff7;padding:36px 20px">
          <div style="max-width:560px;margin:0 auto;background:#132019;border-radius:18px;padding:32px">
            <div style="font-size:13px;letter-spacing:2px;color:#5ee38c;font-weight:700">BETGIFT</div>
            <h1 style="font-size:30px;line-height:1.15;margin:18px 0 10px">Something to root for.</h1>
            <p style="font-size:17px;color:#d7e5da">Hi ${safeName}, someone sent you a sports gift.</p>
            <div style="background:#0d1711;border:1px solid #284333;border-radius:14px;padding:20px;margin:24px 0">
              <div style="font-size:28px;font-weight:800">$${args.amount} on ${safeSelection}</div>
              <p style="color:#b8c9bd;margin-bottom:0">“${safeMessage}”</p>
            </div>
            <a href="${args.giftUrl}" style="display:inline-block;background:#5ee38c;color:#07110a;text-decoration:none;font-weight:800;padding:14px 22px;border-radius:10px">Open your BetGift</a>
            <p style="font-size:12px;color:#8ea095;margin-top:28px">BetGift Alpha does not place a wager or transfer money. Any future wagering action is handled by a licensed sportsbook.</p>
          </div>
        </div>`
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Resend email failed", response.status, detail);
    return { status: "failed" as const };
  }

  return { status: "sent" as const };
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid gift details" }, { status: 400 });
  }

  const recipientEmail = parsed.data.recipientEmail?.trim() || undefined;
  const payload = {
    ...parsed.data,
    recipientEmail,
    createdAt: new Date().toISOString()
  };

  try {
    const code = await createStoredGift(payload);

    if (code) {
      const giftPath = `/g/${code}`;
      const origin = new URL(request.url).origin;
      let emailStatus: "not_requested" | "not_configured" | "sent" | "failed" = "not_requested";

      if (recipientEmail) {
        const emailResult = await sendGiftEmail({
          to: recipientEmail,
          recipientName: payload.recipientName,
          amount: payload.amount,
          selection: payload.bet.selection,
          message: payload.message,
          giftUrl: `${origin}${giftPath}`
        });
        emailStatus = emailResult.status;
        if (emailStatus === "sent" || emailStatus === "failed") {
          await markGiftEmailStatus(code, emailStatus);
        }
      }

      return NextResponse.json({
        token: code,
        giftUrl: giftPath,
        mode: "database",
        emailStatus,
        disclaimer: "No money moved and no wager was placed."
      });
    }
  } catch (error) {
    console.error("Gift creation failed", error);
    return NextResponse.json({ error: "The gift service is temporarily unavailable." }, { status: 503 });
  }

  const token = encodeGift(payload);
  return NextResponse.json({
    token,
    giftUrl: `/gift/${token}`,
    mode: "demo",
    emailStatus: "not_configured",
    disclaimer: "No money moved and no wager was placed."
  });
}
