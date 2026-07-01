import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Mobile OAuth entry point: mobile app opens this URL in a browser
// It forwards the request to better-auth as a POST to initiate the Google OAuth flow
export async function GET(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const proto = req.headers.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const mobileCallbackURL = `${proto}://${host}/api/mobile-callback`;

  const origin = `${proto}://${host}`;
  const syntheticReq = new Request(`${origin}/api/auth/sign-in/social`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": origin,
      "cookie": req.headers.get("cookie") ?? "",
    },
    body: JSON.stringify({ provider: "google", callbackURL: mobileCallbackURL }),
  });

  const res = await auth.handler(syntheticReq);

  // better-auth returns JSON {url, redirect:true} with status 200 for social sign-in.
  // Convert to a real 302 so the browser follows it to Google.
  if (res.status === 200) {
    try {
      const body = await res.clone().json() as { url?: string; redirect?: boolean };
      if (body.redirect && body.url) {
        return new Response(null, { status: 302, headers: { Location: body.url } });
      }
    } catch {}
  }

  return res;
}
