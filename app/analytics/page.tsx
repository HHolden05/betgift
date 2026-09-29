"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type AnalyticsData = {
  totals: {
    gifts: number;
    emailed: number;
    deliveredEmail: number;
    opened: number;
    claimed: number;
    averageAmount: number;
  };
  rates: {
    emailDeliveryRate: number;
    openRate: number;
    claimRate: number;
  };
  topTeams: Array<{ label: string; count: number }>;
  topSelections: Array<{ label: string; count: number }>;
  recentDaily: Array<{ date: string; count: number }>;
};

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const response = await fetch("/api/analytics", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not load analytics.");
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load analytics.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const maxDaily = useMemo(
    () => Math.max(1, ...(data?.recentDaily.map((item) => item.count) ?? [1])),
    [data]
  );

  return (
    <main className="shell">
      <nav className="nav">
        <Link className="brand" href="/"><span className="brandDot" />BETGIFT</Link>
        <div className="buttonRow">
          <Link className="pill" href="/my-gifts">My BetGifts</Link>
          <Link className="pill" href="/create">New gift</Link>
        </div>
      </nav>

      <section className="analyticsHeader">
        <div>
          <p className="eyebrow">FOUNDER VIEW</p>
          <h1>BetGift Analytics</h1>
          <p className="lede small">Live aggregate product usage from Supabase.</p>
        </div>
        <button className="secondaryButton" onClick={load}>Refresh</button>
      </section>

      {error && <p className="error">{error}</p>}
      {!data && !error && <div className="notice">Loading analytics…</div>}

      {data && (
        <>
          <section className="metricGrid">
            <article className="metricCard"><span>Total gifts</span><strong>{data.totals.gifts}</strong></article>
            <article className="metricCard"><span>Average amount</span><strong>${data.totals.averageAmount.toFixed(2)}</strong></article>
            <article className="metricCard"><span>Open rate</span><strong>{percent(data.rates.openRate)}</strong><small>{data.totals.opened} opened</small></article>
            <article className="metricCard"><span>Claim rate</span><strong>{percent(data.rates.claimRate)}</strong><small>{data.totals.claimed} claimed</small></article>
            <article className="metricCard"><span>Email delivery</span><strong>{percent(data.rates.emailDeliveryRate)}</strong><small>{data.totals.deliveredEmail}/{data.totals.emailed} sent</small></article>
          </section>

          <section className="analyticsGrid">
            <article className="flowCard">
              <p className="eyebrow">LAST 14 ACTIVE DAYS</p>
              <h2>Gift creation</h2>
              {data.recentDaily.length === 0 ? (
                <p className="previewMuted">No gift activity yet.</p>
              ) : (
                <div className="barChart">
                  {data.recentDaily.map((item) => (
                    <div className="barColumn" key={item.date}>
                      <div className="barValue">{item.count}</div>
                      <div className="barTrack">
                        <div className="barFill" style={{ height: `${Math.max(8, (item.count / maxDaily) * 100)}%` }} />
                      </div>
                      <span>{new Date(`${item.date}T12:00:00`).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="flowCard">
              <p className="eyebrow">POPULAR</p>
              <h2>Top teams</h2>
              <div className="rankingList">
                {data.topTeams.length === 0 && <p className="previewMuted">Not enough data yet.</p>}
                {data.topTeams.map((item, index) => (
                  <div className="rankingRow" key={item.label}>
                    <span><strong>#{index + 1}</strong> {item.label}</span>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="flowCard">
              <p className="eyebrow">POPULAR</p>
              <h2>Top selections</h2>
              <div className="rankingList">
                {data.topSelections.length === 0 && <p className="previewMuted">Not enough data yet.</p>}
                {data.topSelections.map((item, index) => (
                  <div className="rankingRow" key={item.label}>
                    <span><strong>#{index + 1}</strong> {item.label}</span>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="flowCard">
              <p className="eyebrow">FUNNEL</p>
              <h2>Recipient engagement</h2>
              <div className="funnelList">
                <div><span>Created</span><strong>{data.totals.gifts}</strong></div>
                <div><span>Opened</span><strong>{data.totals.opened}</strong></div>
                <div><span>Claimed</span><strong>{data.totals.claimed}</strong></div>
              </div>
            </article>
          </section>
        </>
      )}
    </main>
  );
}
