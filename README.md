# BetGift Alpha

A mobile-first proof-of-concept for gifting a sports-betting experience.

## What this Alpha does

- Loads upcoming NFL games and moneyline/spread/total markets.
- Uses The Odds API when `ODDS_API_KEY` is configured.
- Falls back to demo games when no API key is present.
- Walks a sender through recipient → game → bet → amount/message → review.
- Generates a shareable recipient link.
- Shows a recipient reveal and simulated sportsbook handoff.

## What it deliberately does not do

- Move money.
- Accept or place wagers.
- Access sportsbook accounts.
- Settle bets or pay winnings.
- Bypass sportsbook KYC, age verification, geolocation, or responsible-gaming controls.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Optional live odds

Create `.env.local`:

```bash
ODDS_API_KEY=your_key_here
```

The events endpoint uses The Odds API v4 NFL odds endpoint with US regions and the `h2h,spreads,totals` markets.

## Important Alpha limitation

Gift links currently encode the demo gift payload in the URL token. This makes links portable across devices without a database, but it is not appropriate for production or real-money use. The next persistence milestone is replacing encoded tokens with opaque database IDs and server-side records.

## Next milestones

1. Supabase/Postgres persistence.
2. User authentication.
3. Real SMS/email delivery.
4. Analytics funnel instrumentation.
5. Operator-approved sportsbook deep links.
6. Legal/compliance review before any real-money functionality.
