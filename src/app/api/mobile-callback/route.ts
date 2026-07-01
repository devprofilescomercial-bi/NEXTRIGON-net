import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// After Google OAuth, better-auth redirects here.
// We read the session token from cookies and redirect to the deep link with the token.
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.session?.token) {
      return new Response(null, {
        status: 302,
        headers: { Location: "nextrigon://auth?error=no_session" },
      });
    }

    const token = encodeURIComponent(session.session.token);
    return new Response(null, {
      status: 302,
      headers: { Location: `nextrigon://auth?token=${token}` },
    });
  } catch (e) {
    console.error("[mobile-callback]", e);
    return new Response(null, {
      status: 302,
      headers: { Location: "nextrigon://auth?error=callback_failed" },
    });
  }
}
