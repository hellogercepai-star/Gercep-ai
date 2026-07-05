import { createHash, randomBytes } from "crypto";

const KEY_PREFIX = "sk-gercep-";

export function generateApiKey(): { plainKey: string; keyPrefix: string; keyHash: string } {
  const secret = randomBytes(24).toString("hex");
  const plainKey = `${KEY_PREFIX}${secret}`;
  const keyPrefix = plainKey.slice(0, 16) + "...";
  const keyHash = hashApiKey(plainKey);
  return { plainKey, keyPrefix, keyHash };
}

export function hashApiKey(plainKey: string): string {
  return createHash("sha256").update(plainKey).digest("hex");
}

export function isGercepApiKey(value: string): boolean {
  return value.startsWith(KEY_PREFIX) && value.length > KEY_PREFIX.length + 8;
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  return token || null;
}
