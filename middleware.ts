import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest, event: NextFetchEvent) {
  const response = NextResponse.next();
  const url = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && secret) {
    const payload = {
      method: request.method,
      path: request.nextUrl.pathname,
      user_agent: request.headers.get("user-agent"),
      referer: request.headers.get("referer")
    };

    event.waitUntil(
      fetch(`${url}/rest/v1/request_logs`, {
        method: "POST",
        headers: {
          apikey: secret,
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify(payload)
      }).catch(() => undefined)
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"
  ]
};
