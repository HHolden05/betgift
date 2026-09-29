import Link from "next/link";
import { decodeGift } from "@/lib/gift-token";

function americanPayout(stake: number, odds: number) {
  const profit = odds > 0 ? stake * (odds / 100) : stake * (100 / Math.abs(odds));
  return stake + profit;
}

export default async function GiftPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const gift = decodeGift(token);

  if (!gift) {
    return <main className="shell compact"><section className="flowCard"><h1>Gift link not found</h1><Link className="primaryButton" href="/">Back home</Link></section></main>;
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

        <Link className="primaryButton" href={`/claim?token=${encodeURIComponent(token)}&book=FanDuel`}>Claim with FanDuel</Link>
        <Link className="secondaryButton" href={`/claim?token=${encodeURIComponent(token)}&book=DraftKings`}>Claim with DraftKings</Link>
      </section>
    </main>
  );
}
