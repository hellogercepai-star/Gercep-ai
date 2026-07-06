import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getAdminSessionToken,
  isValidAdminSecret,
} from "@/lib/gateway/admin-auth";

const COOKIE_MAX_AGE = 60 * 60 * 12; // 12 hours

// POST /api/v1/admin/session — login with GATEWAY_ADMIN_SECRET
export async function POST(request: NextRequest) {
  let body: { secret?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!isValidAdminSecret(body.secret?.trim())) {
    return NextResponse.json({ error: "Invalid admin secret." }, { status: 401 });
  }

  const token = getAdminSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: "GATEWAY_ADMIN_SECRET not configured." },
      { status: 503 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return response;
}

// DELETE /api/v1/admin/session — logout
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
