import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? "";

// Mobile OAuth entry point: mobile app opens this URL in a browser.
// If the request arrives via a non-canonical domain (e.g. sslip.io alias),
// we first redirect to the canonical domain so the state cookie is set on
// the same domain as the Google callback, preventing state_mismatch errors.
export async function GET(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const proto = req.headers.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const currentOrigin = `${proto}://${host}`;
  const canonicalOrigin = APP_URL || currentOrigin;

  if (APP_URL && currentOrigin !== canonicalOrigin) {
    return new Response(null, {
      status: 302,
      headers: { Location: `${canonicalOrigin}/api/auth/mobile-google` },
    });
  }

  const mobileCallbackURL = `${canonicalOrigin}/api/mobile-callback`;

  const syntheticReq = new Request(`${canonicalOrigin}/api/auth/sign-in/social`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": canonicalOrigin,
      "cookie": req.headers.get("cookie") ?? "",
    },
    body: JSON.stringify({ provider: "google", callbackURL: mobileCallbackURL }),
  });

  const res = await auth.handler(syntheticReq);

  // better-auth returns JSON {url, redirect:true} with status 200 for social sign-in.
  // Convert to a real 302, forwarding Set-Cookie headers so the state cookie
  // reaches the browser (required for state verification on the callback).
  if (res.status === 200) {
    try {
      const body = await res.clone().json() as { url?: string; redirect?: boolean };
      if (body.redirect && body.url) {
        const headers = new Headers({ Location: body.url });
        res.headers.forEach((value, key) => {
          if (key.toLowerCase() === "set-cookie") {
            headers.append("set-cookie", value);
          }
        });
        return new Response(null, { status: 302, headers });
      }
    } catch {}
  }

  return res;
}
