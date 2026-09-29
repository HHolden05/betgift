import type { EventOption } from "./types";

export const demoEvents: EventOption[] = [
  {
    id: "demo-phi-dal",
    sportKey: "americanfootball_nfl",
    league: "NFL",
    homeTeam: "Philadelphia Eagles",
    awayTeam: "Dallas Cowboys",
    commenceTime: "2026-10-04T00:20:00.000Z",
    bets: [
      { market: "h2h", label: "Moneyline", selection: "Philadelphia Eagles", odds: 125, bookmaker: "Demo market" },
      { market: "spreads", label: "Spread -2.5", selection: "Philadelphia Eagles", odds: -110, point: -2.5, bookmaker: "Demo market" },
      { market: "totals", label: "Over 47.5", selection: "Over", odds: -110, point: 47.5, bookmaker: "Demo market" }
    ]
  },
  {
    id: "demo-kc-buf",
    sportKey: "americanfootball_nfl",
    league: "NFL",
    homeTeam: "Kansas City Chiefs",
    awayTeam: "Buffalo Bills",
    commenceTime: "2026-10-04T20:25:00.000Z",
    bets: [
      { market: "h2h", label: "Moneyline", selection: "Buffalo Bills", odds: 115, bookmaker: "Demo market" },
      { market: "spreads", label: "Spread +2.5", selection: "Buffalo Bills", odds: -110, point: 2.5, bookmaker: "Demo market" },
      { market: "totals", label: "Over 50.5", selection: "Over", odds: -105, point: 50.5, bookmaker: "Demo market" }
    ]
  }
];
