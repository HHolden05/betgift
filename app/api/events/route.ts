import { NextResponse } from "next/server";
import { demoEvents } from "@/lib/demo-data";
import type { BetOption, EventOption, MarketKey } from "@/lib/types";

type OddsOutcome = { name: string; price: number; point?: number };
type OddsMarket = { key: MarketKey; outcomes: OddsOutcome[] };
type Bookmaker = { key: string; title: string; markets: OddsMarket[] };
type OddsEvent = {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
};

function normalize(events: OddsEvent[]): EventOption[] {
  return events.slice(0, 8).map((event) => {
    const preferred =
      event.bookmakers.find((b) => b.key === "fanduel") ??
      event.bookmakers.find((b) => b.key === "draftkings") ??
      event.bookmakers[0];

    const bets: BetOption[] = [];
    for (const market of preferred?.markets ?? []) {
      for (const outcome of market.outcomes) {
        if (market.key === "h2h") {
          bets.push({
            market: "h2h",
            label: "Moneyline",
            selection: outcome.name,
            odds: outcome.price,
            bookmaker: preferred.title
          });
        }
        if (market.key === "spreads" && outcome.name === event.home_team) {
          bets.push({
            market: "spreads",
            label: `Spread ${(outcome.point ?? 0) > 0 ? "+" : ""}${outcome.point ?? ""}`,
            selection: outcome.name,
            odds: outcome.price,
            point: outcome.point,
            bookmaker: preferred.title
          });
        }
        if (market.key === "totals" && outcome.name === "Over") {
          bets.push({
            market: "totals",
            label: `Over ${outcome.point ?? ""}`,
            selection: "Over",
            odds: outcome.price,
            point: outcome.point,
            bookmaker: preferred.title
          });
        }
      }
    }

    return {
      id: event.id,
      sportKey: event.sport_key,
      league: event.sport_title,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      commenceTime: event.commence_time,
      bets: bets.slice(0, 6)
    };
  });
}

export async function GET() {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ mode: "demo", events: demoEvents });
  }

  const url = new URL("https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/");
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("regions", "us");
  url.searchParams.set("markets", "h2h,spreads,totals");
  url.searchParams.set("oddsFormat", "american");

  try {
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) throw new Error(`Odds API returned ${response.status}`);
    const data = (await response.json()) as OddsEvent[];
    const events = normalize(data).filter((event) => event.bets.length > 0);
    return NextResponse.json({ mode: "live", events });
  } catch {
    return NextResponse.json({ mode: "demo", events: demoEvents });
  }
}
