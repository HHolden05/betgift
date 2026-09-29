import { randomBytes } from "crypto";
import type { GiftPayload } from "@/lib/types";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export type GiftStatus = "created" | "opened" | "claimed";

type GiftRow = {
  code: string;
  recipient_name: string;
  recipient_phone: string | null;
  amount: number;
  message: string;
  event_data: GiftPayload["event"];
  bet_data: GiftPayload["bet"];
  status: GiftStatus;
  created_at: string;
  opened_at: string | null;
  claimed_at: string | null;
};

function makeCode(length = 8) {
  const bytes = randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i += 1) code += ALPHABET[bytes[i] % ALPHABET.length];
  return code;
}

function rowToGift(row: GiftRow): GiftPayload {
  return {
    recipientName: row.recipient_name,
    recipientPhone: row.recipient_phone ?? undefined,
    amount: Number(row.amount),
    message: row.message,
    event: row.event_data,
    bet: row.bet_data,
    createdAt: row.created_at
  };
}

export async function createStoredGift(payload: GiftPayload) {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseAdmin();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = makeCode();
    const { error } = await supabase.from("gifts").insert({
      code,
      recipient_name: payload.recipientName,
      recipient_phone: payload.recipientPhone || null,
      amount: payload.amount,
      message: payload.message,
      event_data: payload.event,
      bet_data: payload.bet,
      status: "created",
      created_at: payload.createdAt
    });

    if (!error) return code;
    if (error.code !== "23505") throw error;
  }

  throw new Error("Could not generate a unique gift code");
}

export async function getStoredGift(code: string, markOpened = false) {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.from("gifts").select("*").eq("code", code).maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const row = data as GiftRow;

  if (markOpened && row.status === "created") {
    await supabase
      .from("gifts")
      .update({ status: "opened", opened_at: new Date().toISOString() })
      .eq("code", code)
      .eq("status", "created");
  }

  return rowToGift(row);
}

export async function markGiftClaimed(code: string) {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseAdmin();

  await supabase
    .from("gifts")
    .update({ status: "claimed", claimed_at: new Date().toISOString() })
    .eq("code", code);
}
