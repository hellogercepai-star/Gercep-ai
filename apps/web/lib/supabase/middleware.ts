import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionCookie,
} from "@/lib/gateway/admin-auth";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login")
  ) {
    const cookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!isValidAdminSessionCookie(cookie)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname === "/admin/login") {
    const cookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (isValidAdminSessionCookie(cookie)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard");

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
