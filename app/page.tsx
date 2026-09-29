import Link from "next/link";

export default function HomePage() {
  return (
    <main className="shell">
      <nav className="nav">
        <div className="brand"><span className="brandDot" />BETGIFT</div>
        <div className="buttonRow">
          <Link className="pill" href="/my-gifts">My BetGifts</Link>
          <Link className="pill" href="/analytics">Analytics</Link>
          <span className="pill">Alpha</span>
        </div>
      </nav>

      <section className="hero">
        <p className="eyebrow">SPORTS GIFTING, REIMAGINED</p>
        <h1>Send a bet.<br />Make the game the gift.</h1>
        <p className="lede">
          Choose the game, the wager and the amount. Your friend opens a shareable BetGift and gets something to root for.
        </p>
        <div className="heroActions">
          <Link className="primaryButton" href="/create">Create a BetGift</Link>
          <span className="finePrint">Alpha uses simulated wagering. No money is moved.</span>
        </div>
      </section>

      <section className="giftPreview">
        <div className="eyebrow">BIRTHDAY BET</div>
        <div className="previewAmount">$50 on the Eagles</div>
        <div className="previewRow"><span>Eagles ML</span><strong>+125</strong></div>
        <div className="previewMuted">Potential return: $112.50</div>
      </section>

      <section className="threeUp">
        <article><span>01</span><h3>Pick the game</h3><p>Start with a matchup they already care about.</p></article>
        <article><span>02</span><h3>Choose the bet</h3><p>Moneyline, spread or total — simple enough to understand instantly.</p></article>
        <article><span>03</span><h3>Send the moment</h3><p>They open a private gift link with your message and the wager attached.</p></article>
      </section>
    </main>
  );
}
