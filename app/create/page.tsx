"use client";

import { useEffect, useMemo, useState } from "react";
import type { BetOption, EventOption } from "@/lib/types";

const amounts = [25, 50, 100];

function americanPayout(stake: number, odds: number) {
  const profit = odds > 0 ? stake * (odds / 100) : stake * (100 / Math.abs(odds));
  return stake + profit;
}

export default function CreatePage() {
  const [events, setEvents] = useState<EventOption[]>([]);
  const [mode, setMode] = useState("loading");
  const [step, setStep] = useState(1);
  const [recipientName, setRecipientName] = useState("John");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [event, setEvent] = useState<EventOption | null>(null);
  const [bet, setBet] = useState<BetOption | null>(null);
  const [amount, setAmount] = useState(50);
  const [message, setMessage] = useState("Happy birthday — Go Birds.");
  const [giftUrl, setGiftUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => {
        setEvents(data.events ?? []);
        setMode(data.mode ?? "demo");
      })
      .catch(() => setError("Could not load games."));
  }, []);

  const payout = useMemo(() => bet ? americanPayout(amount, bet.odds) : 0, [amount, bet]);

  function textGift() {
    if (!giftUrl) return;
    const body = `You got a BetGift 🎁 ${giftUrl}`;
    window.location.href = `sms:${recipientPhone ? recipientPhone.replace(/[^+\d]/g, "") : ""}?&body=${encodeURIComponent(body)}`;
  }

  async function copyGiftLink() {
    if (!giftUrl) return;
    try {
      await navigator.clipboard.writeText(giftUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Copy failed. You can still select the link manually.");
    }
  }

  async function createGift() {
    if (!event || !bet || !recipientName.trim()) return;
    setError("");
    const response = await fetch("/api/gifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientName, recipientPhone, recipientEmail, amount, message, event, bet })
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Could not create gift.");
      return;
    }
    setGiftUrl(`${window.location.origin}${data.giftUrl}`);
    setEmailStatus(data.emailStatus ?? "");

    if (data.mode === "database" && data.token) {
      try {
        const storageKey = "betgift:saved-codes";
        const current = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
        const codes = Array.isArray(current) ? current.filter((code) => typeof code === "string") : [];
        const next = [String(data.token).toUpperCase(), ...codes.filter((code) => code !== data.token)].slice(0, 100);
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Gift creation still succeeds if local history cannot be saved.
      }
    }

    setStep(6);
  }

  return (
    <main className="shell compact">
      <nav className="nav">
        <a className="brand" href="/"><span className="brandDot" />BETGIFT</a>
        <span className="pill">{mode === "live" ? "Live odds" : "Demo odds"}</span>
      </nav>

      <div className="progress">
        <div className="progressBar" style={{ width: `${Math.min(step, 5) * 20}%` }} />
      </div>

      {step === 1 && (
        <section className="flowCard">
          <p className="eyebrow">STEP 1 OF 5</p>
          <h1>Who’s getting the bet?</h1>
          <p className="lede small">Add their name and how you want the gift delivered.</p>
          <label>Name<input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Recipient name" /></label>
          <label>Email <span className="optional">(for delivery)</span><input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="friend@example.com" /></label>
          <label>Phone <span className="optional">(optional in Alpha)</span><input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="(215) 555-0184" /></label>
          <button className="primaryButton" disabled={!recipientName.trim()} onClick={() => setStep(2)}>Choose a game</button>
        </section>
      )}

      {step === 2 && (
        <section className="flowCard">
          <p className="eyebrow">STEP 2 OF 5</p>
          <h1>Pick what they’ll watch</h1>
          <p className="lede small">Choose an upcoming matchup.</p>
          <div className="optionGrid">
            {events.map((item) => (
              <button key={item.id} className={`optionCard ${event?.id === item.id ? "selected" : ""}`} onClick={() => { setEvent(item); setBet(null); }}>
                <span className="eyebrow">{item.league}</span>
                <strong>{item.awayTeam}</strong>
                <span>at {item.homeTeam}</span>
                <small>{new Date(item.commenceTime).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" })}</small>
              </button>
            ))}
          </div>
          <div className="buttonRow">
            <button className="secondaryButton" onClick={() => setStep(1)}>Back</button>
            <button className="primaryButton" disabled={!event} onClick={() => setStep(3)}>Choose the bet</button>
          </div>
        </section>
      )}

      {step === 3 && event && (
        <section className="flowCard">
          <p className="eyebrow">STEP 3 OF 5</p>
          <h1>Choose what’s riding on it</h1>
          <p className="lede small">{event.awayTeam} at {event.homeTeam}</p>
          <div className="optionGrid">
            {event.bets.map((item, index) => (
              <button key={index} className={`optionCard ${bet === item ? "selected" : ""}`} onClick={() => setBet(item)}>
                <span className="eyebrow">{item.label}</span>
                <strong>{item.selection}</strong>
                <span className="odds">{item.odds > 0 ? "+" : ""}{item.odds}</span>
                <small>{item.bookmaker ?? "Market odds"}</small>
              </button>
            ))}
          </div>
          <div className="buttonRow">
            <button className="secondaryButton" onClick={() => setStep(2)}>Back</button>
            <button className="primaryButton" disabled={!bet} onClick={() => setStep(4)}>Personalize</button>
          </div>
        </section>
      )}

      {step === 4 && bet && (
        <section className="flowCard">
          <p className="eyebrow">STEP 4 OF 5</p>
          <h1>Make it personal</h1>
          <div className="amountRow">
            {amounts.map((value) => (
              <button key={value} className={`amount ${amount === value ? "selected" : ""}`} onClick={() => setAmount(value)}>${value}</button>
            ))}
          </div>
          <label>Message<textarea value={message} maxLength={280} onChange={(e) => setMessage(e.target.value)} /></label>
          <div className="summaryStrip"><span>Potential return</span><strong>${payout.toFixed(2)}</strong></div>
          <div className="buttonRow">
            <button className="secondaryButton" onClick={() => setStep(3)}>Back</button>
            <button className="primaryButton" onClick={() => setStep(5)}>Review gift</button>
          </div>
        </section>
      )}

      {step === 5 && event && bet && (
        <section className="flowCard">
          <p className="eyebrow">STEP 5 OF 5</p>
          <h1>One last look</h1>
          <div className="giftPreview">
            <div className="eyebrow">TO {recipientName.toUpperCase()}</div>
            <div className="previewAmount">${amount} on {bet.selection}</div>
            <div className="previewRow"><span>{bet.label}</span><strong>{bet.odds > 0 ? "+" : ""}{bet.odds}</strong></div>
            <div className="previewMuted">Potential return: ${payout.toFixed(2)}</div>
            <div className="giftMessage">“{message}”</div>
          </div>
          <div className="summaryStrip"><span>Prototype total</span><strong>${(amount + 2.99).toFixed(2)}</strong></div>
          <p className="finePrint">This Alpha does not charge you. No wager is placed.</p>
          <div className="buttonRow">
            <button className="secondaryButton" onClick={() => setStep(4)}>Back</button>
            <button className="primaryButton" onClick={createGift}>Create share link</button>
          </div>
        </section>
      )}

      {step === 6 && (
        <section className="flowCard successCard">
          <p className="eyebrow">BETGIFT CREATED</p>
          <h1>Send it to {recipientName}</h1>
          <p className="lede small">
            {emailStatus === "sent"
              ? `Email sent to ${recipientEmail}.`
              : recipientEmail
                ? "Gift created. Email delivery is not configured yet, so use the link below."
                : "Gift created. Copy the link below to send it."}
          </p>
          <div className="shareBox">{giftUrl}</div>
          <div className="buttonRow">
            <button className="secondaryButton" onClick={copyGiftLink}>{copied ? "Copied" : "Copy gift link"}</button>
            <button className="secondaryButton" onClick={textGift}>Text gift</button>
            <a className="primaryButton" href={giftUrl}>Open recipient view</a>
          </div>
          <div className="buttonRow">
            <a className="secondaryButton" href="/my-gifts">My BetGifts</a>
            <button className="secondaryButton" onClick={() => { setStep(1); setGiftUrl(""); setCopied(false); setEmailStatus(""); }}>Create another</button>
          </div>
        </section>
      )}

      {error && <p className="error">{error}</p>}
    </main>
  );
}
