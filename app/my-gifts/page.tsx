"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type HistoryGift = {
  code: string;
  recipientName: string;
  recipientEmail?: string | null;
  amount: number;
  event: {
    homeTeam: string;
    awayTeam: string;
    commenceTime: string;
  };
  bet: {
    label: string;
    selection: string;
    odds: number;
  };
  status: "created" | "opened" | "claimed";
  emailStatus?: string;
  createdAt: string;
  openedAt?: string | null;
  claimedAt?: string | null;
};

const STORAGE_KEY = "betgift:saved-codes";

function readSavedCodes() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((code) => typeof code === "string") : [];
  } catch {
    return [];
  }
}

function formatOdds(odds: number) {
  return odds > 0 ? `+${odds}` : String(odds);
}

export default function MyGiftsPage() {
  const [gifts, setGifts] = useState<HistoryGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadHistory() {
    setLoading(true);
    setError("");

    const codes = readSavedCodes();
    if (!codes.length) {
      setGifts([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/my-gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load gifts.");

      setGifts(data.gifts ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load gifts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  function clearHistory() {
    window.localStorage.removeItem(STORAGE_KEY);
    setGifts([]);
  }

  return (
    <main className="shell compact">
      <nav className="nav">
        <Link className="brand" href="/"><span className="brandDot" />BETGIFT</Link>
        <Link className="pill" href="/create">New gift</Link>
      </nav>

      <section className="flowCard">
        <p className="eyebrow">THIS BROWSER</p>
        <h1>My BetGifts</h1>
        <p className="lede small">
          Gifts created on this browser appear here automatically. No account required.
        </p>

        {loading && <div className="notice">Loading your gifts…</div>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && gifts.length === 0 && (
          <div className="giftPreview">
            <div className="eyebrow">NO GIFTS YET</div>
            <p className="previewMuted">Create your first BetGift and it will show up here.</p>
            <Link className="primaryButton" href="/create">Create a BetGift</Link>
          </div>
        )}

        <div className="historyList">
          {gifts.map((gift) => (
            <article className="giftPreview historyCard" key={gift.code}>
              <div className="previewRow">
                <span className="eyebrow">TO {gift.recipientName.toUpperCase()}</span>
                <span className={`statusBadge status-${gift.status}`}>{gift.status}</span>
              </div>

              <div className="previewAmount">${gift.amount} on {gift.bet.selection}</div>
              <div className="previewRow">
                <span>{gift.bet.label}</span>
                <strong>{formatOdds(gift.bet.odds)}</strong>
              </div>

              <div className="previewMuted">
                {gift.event.awayTeam} at {gift.event.homeTeam}
              </div>
              <div className="previewMuted">
                Created {new Date(gift.createdAt).toLocaleString()}
              </div>
              {gift.recipientEmail && (
                <div className="previewMuted">
                  Email: {gift.emailStatus === "sent" ? "sent" : gift.emailStatus || "not sent"}
                </div>
              )}

              <div className="buttonRow">
                <Link className="secondaryButton" href={`/g/${gift.code}`}>Open gift</Link>
                <button className="secondaryButton" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/g/${gift.code}`)}>
                  Copy link
                </button>
              </div>
            </article>
          ))}
        </div>

        {gifts.length > 0 && (
          <div className="buttonRow">
            <button className="secondaryButton" onClick={loadHistory}>Refresh statuses</button>
            <button className="secondaryButton" onClick={clearHistory}>Clear this browser</button>
          </div>
        )}
      </section>
    </main>
  );
}
