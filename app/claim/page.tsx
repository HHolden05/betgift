import Link from "next/link";
import { decodeGift } from "@/lib/gift-token";
import { getStoredGift, markGiftClaimed } from "@/lib/gifts-db";

export const dynamic = "force-dynamic";

export default async function ClaimPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string; code?: string; book?: string }>
}) {
  const query = await searchParams;
  const code = query.code?.toUpperCase();

  let gift = null;
  if (code) {
    gift = await getStoredGift(code);
    if (gift) await markGiftClaimed(code);
  } else if (query.token) {
    gift = decodeGift(query.token);
  }

  const book = query.book || "sportsbook";

  return (
    <main className="shell compact">
      <nav className="nav">
        <Link className="brand" href="/"><span className="brandDot" />BETGIFT</Link>
        <span className="pill">Partner simulation</span>
      </nav>
      <section className="flowCard">
        <p className="eyebrow">SIMULATED HANDOFF</p>
        <h1>Continue securely with {book}</h1>
        <p className="lede small">
          In a future operator integration, the sportsbook would handle identity, age, geolocation, wager acceptance, settlement and winnings.
        </p>
        {gift && (
          <div className="giftPreview">
            <div className="eyebrow">BETGIFT SELECTION</div>
            <div className="previewAmount">${gift.amount} on {gift.bet.selection}</div>
            <div className="previewRow"><span>{gift.bet.label}</span><strong>{gift.bet.odds > 0 ? "+" : ""}{gift.bet.odds}</strong></div>
          </div>
        )}
        <div className="notice">No wager was placed. No sportsbook account was accessed.</div>
        <Link className="primaryButton" href="/">Restart demo</Link>
      </section>
    </main>
  );
}
