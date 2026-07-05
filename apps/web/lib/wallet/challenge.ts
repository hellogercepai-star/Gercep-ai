import { buildWalletLinkMessage } from "@/lib/wallet/solana";

export const CHALLENGE_TTL_MS = 5 * 60 * 1000;

/** Host/domain bound into signed messages to prevent cross-origin replay. */
export function getAppDomain(request?: Request): string {
  if (request) {
    const forwarded = request.headers.get("x-forwarded-host");
    const host = forwarded ?? request.headers.get("host");
    if (host) return host.split(",")[0]!.trim().toLowerCase();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (siteUrl) {
    try {
      return new URL(siteUrl).host.toLowerCase();
    } catch {
      /* fall through */
    }
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return vercel.toLowerCase();

  return "localhost:3000";
}

export function buildChallengeMessage(input: {
  address: string;
  nonce: string;
  expiresAt: Date;
  domain: string;
}): string {
  return buildWalletLinkMessage(input);
}

export function extractAddressFromLinkMessage(message: string): string | null {
  const match = message.match(/^Address: (.+)$/m);
  return match?.[1]?.trim() ?? null;
}

export function isChallengeExpired(expiresAt: string | Date): boolean {
  return new Date(expiresAt).getTime() <= Date.now();
}
