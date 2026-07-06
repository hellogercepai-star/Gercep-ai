import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE = "gercep_admin_auth";
const SESSION_SALT = "gercep-admin-session-v1";

export function getAdminSessionToken(): string | null {
  const secret = process.env.GATEWAY_ADMIN_SECRET?.trim();
  if (!secret) return null;
  return createHmac("sha256", SESSION_SALT).update(secret).digest("hex");
}

export function isValidAdminSecret(candidate: string | null | undefined): boolean {
  const secret = process.env.GATEWAY_ADMIN_SECRET?.trim();
  if (!secret || !candidate) return false;
  if (secret.length !== candidate.length) return false;
  try {
    return timingSafeEqual(Buffer.from(secret), Buffer.from(candidate));
  } catch {
    return false;
  }
}

export function isValidAdminSessionCookie(cookieValue: string | null | undefined): boolean {
  const expected = getAdminSessionToken();
  if (!expected || !cookieValue) return false;
  if (expected.length !== cookieValue.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(cookieValue));
  } catch {
    return false;
  }
}

export function isAdminAuthorized(request: NextRequest): boolean {
  if (isValidAdminSecret(request.headers.get("x-admin-secret"))) return true;
  return isValidAdminSessionCookie(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  );
}
