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

  return auth.handler(syntheticReq);
}
