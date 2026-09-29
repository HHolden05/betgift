export type MarketKey = "h2h" | "spreads" | "totals";

export type BetOption = {
  market: MarketKey;
  label: string;
  selection: string;
  odds: number;
  point?: number;
  bookmaker?: string;
};

export type EventOption = {
  id: string;
  sportKey: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  bets: BetOption[];
};

export type GiftPayload = {
  recipientName: string;
  recipientPhone?: string;
  recipientEmail?: string;
  amount: number;
  message: string;
  event: EventOption;
  bet: BetOption;
  createdAt: string;
};
