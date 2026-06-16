export async function POST(req: Request) {
  const body = await req.json().catch(() => ({ error: "json parse failed" }))
  return Response.json({ received: body, method: "POST" })
}
export async function GET() {
  return Response.json({ status: "echo ready" })
}
