export async function GET() {
  return new Response(JSON.stringify({
    status: "ok",
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL ? "set" : "unset",
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "unset",
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? "set" : "unset",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "set" : "unset",
    },
    node: process.version,
  }), {
    headers: { "content-type": "application/json" },
  })
}
