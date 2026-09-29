import Link from "next/link";
import { getStoredGift } from "@/lib/gifts-db";

function americanPayout(stake: number, odds: number) {
  const profit = odds > 0 ? stake * (odds / 100) : stake * (100 / Math.abs(odds));
  return stake + profit;
}

export const dynamic = "force-dynamic";

export default async function ShortGiftPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const gift = await getStoredGift(code.toUpperCase(), true);

  if (!gift) {
    return (
      <main className="shell compact">
        <section className="flowCard">
          <h1>Gift link not found</h1>
          <p className="lede small">This BetGift may have expired or the link is incorrect.</p>
          <Link className="primaryButton" href="/">Back home</Link>
        </section>
      </main>
    );
  }

  const payout = americanPayout(gift.amount, gift.bet.odds);

  return (
    <main className="shell compact">
      <nav className="nav">
        <Link className="brand" href="/"><span className="brandDot" />BETGIFT</Link>
        <span className="pill">Recipient view</span>
      </nav>

      <section className="reveal">
        <p className="eyebrow">SOMEONE SENT YOU SOMETHING TO ROOT FOR</p>
        <h1>{gift.recipientName}, your gift is riding on the game.</h1>
        <div className="giftPreview revealCard">
          <div className="eyebrow">YOUR BETGIFT</div>
          <div className="previewAmount">${gift.amount} on {gift.bet.selection}</div>
          <div className="previewRow"><span>{gift.bet.label}</span><strong>{gift.bet.odds > 0 ? "+" : ""}{gift.bet.odds}</strong></div>
          <div className="previewMuted">{gift.event.awayTeam} at {gift.event.homeTeam}</div>
          <div className="previewMuted">Potential return: ${payout.toFixed(2)}</div>
          <div className="giftMessage">“{gift.message}”</div>
        </div>

        <p className="finePrint">
          Alpha simulation: BetGift does not place this wager, transfer money, or access a sportsbook account.
        </p>

        <Link className="primaryButton" href={`/claim?code=${encodeURIComponent(code)}&book=FanDuel`}>Claim with FanDuel</Link>
        <Link className="secondaryButton" href={`/claim?code=${encodeURIComponent(code)}&book=DraftKings`}>Claim with DraftKings</Link>
      </section>
    </main>
  );
}
