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

## Deploy on Vercel

1. Import the `HHolden05/betgift` GitHub repository into Vercel.
2. Use the default Next.js build settings.
3. Deploy once with no environment variables to run in demo-odds mode.
4. When you have an Odds API key, add `ODDS_API_KEY` in the Vercel project's environment variables and redeploy.


## Optional live odds

Create `.env.local`:

```bash
ODDS_API_KEY=your_key_here
```

The events endpoint uses The Odds API v4 NFL odds endpoint with US regions and the `h2h,spreads,totals` markets.

## Database-backed gift links

When Supabase is configured, BetGift stores gifts server-side and generates short links such as:

```
https://betgift.vercel.app/g/A7KF29QX
```

Opening a stored gift updates its status from `created` to `opened`. Entering the simulated sportsbook handoff updates it to `claimed`.

If Supabase environment variables are missing, the app keeps the older encoded-link demo mode so the site remains usable.

## Supabase setup

Run `supabase/schema.sql` in the Supabase SQL editor, then add these Vercel environment variables:

```
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
```

Never expose the service-role key in client-side code or commit it to GitHub.

## Next milestones

1. User authentication.
2. Real SMS/email delivery.
3. Analytics funnel instrumentation.
4. Operator-approved sportsbook deep links.
5. Legal/compliance review before any real-money functionality.


## Fastest production deployment

Because this repository is already on GitHub, the recommended deployment path is Vercel Git integration:

1. In Vercel, choose **Add New → Project**.
2. Import **HHolden05/betgift**.
3. Keep Framework Preset as **Next.js**.
4. Keep Root Directory as **./**.
5. Do not add any environment variables for the first deploy; BetGift will use demo odds.
6. Click **Deploy**.
7. After the first deployment is live, optionally add **ODDS_API_KEY** and redeploy for live odds.

No build command override is needed. Vercel will use `npm run build`.
