import type { GiftPayload } from "./types";

export function encodeGift(payload: GiftPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeGift(token: string): GiftPayload | null {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    return JSON.parse(raw) as GiftPayload;
  } catch {
    return null;
  }
}
