"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Gift = {
  code: string;
  recipient_name: string;
  recipient_email: string | null;
  recipient_phone: string | null;
  amount: number;
  event_data: { homeTeam?: string; awayTeam?: string } | null;
  bet_data: { selection?: string; label?: string } | null;
  status: string;
  email_status: string | null;
  created_at: string;
  opened_at: string | null;
  claimed_at: string | null;
};

type RequestLog = {
  id: number;
  created_at: string;
  method: string;
  path: string;
  user_agent: string | null;
  referer: string | null;
};

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [requests, setRequests] = useState<RequestLog[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const saved = window.sessionStorage.getItem("betgift:admin-key");
    if (saved) {
      setKey(saved);
      load(saved);
    }
  }, []);

  async function load(accessKey = key) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin", {
        cache: "no-store",
        headers: { "x-admin-key": accessKey }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load admin data.");
      setGifts(data.gifts ?? []);
      setRequests(data.requests ?? []);
      setUnlocked(true);
      window.sessionStorage.setItem("betgift:admin-key", accessKey);
    } catch (err) {
      setUnlocked(false);
      setError(err instanceof Error ? err.message : "Could not load admin data.");
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    load(key);
  }

  function lock() {
    window.sessionStorage.removeItem("betgift:admin-key");
    setUnlocked(false);
    setGifts([]);
    setRequests([]);
    setKey("");
  }

  if (!unlocked) {
    return (
      <main className="shell compact">
        <nav className="nav">
          <Link className="brand" href="/"><span className="brandDot" />BETGIFT</Link>
          <span className="pill">Admin</span>
        </nav>

        <section className="flowCard">
          <p className="eyebrow">PRIVATE</p>
          <h1>Admin access</h1>
          <p className="lede small">Enter your BetGift admin key. It stays only in this browser session.</p>
          <form onSubmit={submit} className="flowCard adminLogin">
            <label>Admin key<input type="password" value={key} onChange={(event) => setKey(event.target.value)} autoComplete="off" /></label>
            <button className="primaryButton" disabled={!key || loading}>{loading ? "Checking…" : "Open admin"}</button>
          </form>
          {error && <p className="error">{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <nav className="nav">
        <Link className="brand" href="/"><span className="brandDot" />BETGIFT</Link>
        <div className="buttonRow">
          <button className="pill" onClick={() => load()}>Refresh</button>
          <button className="pill" onClick={lock}>Lock</button>
        </div>
      </nav>

      <section className="analyticsHeader">
        <div>
          <p className="eyebrow">PRIVATE CONTROL CENTER</p>
          <h1>BetGift Admin</h1>
          <p className="lede small">Gift activity and technical requests in one place.</p>
        </div>
      </section>

      <section className="adminStats">
        <article className="metricCard"><span>Gift records</span><strong>{gifts.length}</strong></article>
        <article className="metricCard"><span>Recent requests</span><strong>{requests.length}</strong></article>
        <article className="metricCard"><span>Claimed</span><strong>{gifts.filter((gift) => gift.status === "claimed").length}</strong></article>
        <article className="metricCard"><span>Emails sent</span><strong>{gifts.filter((gift) => gift.email_status === "sent").length}</strong></article>
      </section>

      <section className="adminGrid">
        <article className="flowCard adminPanel">
          <div className="previewRow">
            <div>
              <p className="eyebrow">GIFTS</p>
              <h2>Every BetGift</h2>
            </div>
            <span className="pill">{gifts.length}</span>
          </div>

          <div className="adminTableWrap">
            <table className="adminTable">
              <thead>
                <tr>
                  <th>Created</th>
                  <th>Recipient</th>
                  <th>Gift</th>
                  <th>Status</th>
                  <th>Delivery</th>
                  <th>Code</th>
                </tr>
              </thead>
              <tbody>
                {gifts.map((gift) => (
                  <tr key={gift.code}>
                    <td>{new Date(gift.created_at).toLocaleString()}</td>
                    <td>
                      <strong>{gift.recipient_name}</strong>
                      <small>{gift.recipient_email || gift.recipient_phone || "Link only"}</small>
                    </td>
                    <td>
                      <strong>${Number(gift.amount).toFixed(2)}</strong>
                      <small>{gift.bet_data?.selection || "Unknown selection"}</small>
                    </td>
                    <td><span className={`statusBadge status-${gift.status}`}>{gift.status}</span></td>
                    <td>{gift.email_status || "—"}</td>
                    <td><Link href={`/g/${gift.code}`}>{gift.code}</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="flowCard adminPanel">
          <div className="previewRow">
            <div>
              <p className="eyebrow">TECHNICAL</p>
              <h2>Recent requests</h2>
            </div>
            <span className="pill">{requests.length}</span>
          </div>

          <p className="previewMuted">
            These are application requests recorded by BetGift. Use Vercel runtime logs for platform-level errors and function output.
          </p>

          <div className="adminTableWrap">
            <table className="adminTable">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Method</th>
                  <th>Path</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{new Date(request.created_at).toLocaleString()}</td>
                    <td><strong>{request.method}</strong></td>
                    <td><code>{request.path}</code></td>
                    <td><small>{request.referer || request.user_agent || "Direct"}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <a className="secondaryButton" href="https://vercel.com/dashboard" target="_blank" rel="noreferrer">
            Open Vercel raw logs
          </a>
        </article>
      </section>
    </main>
  );
}
