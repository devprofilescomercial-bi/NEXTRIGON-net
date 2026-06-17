import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

async function authUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") || ""
  if (!token) return null
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return null
  return user
}

export async function GET(req: NextRequest) {
  const user = await authUser(req)
  if (!user) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })

  const { data } = await supabaseAdmin.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50)

  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const user = await authUser(req)
  if (!user) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })

  const body = await req.json().catch(() => ({}))

  if (body.action === "read_all") {
    await supabaseAdmin.from("notifications").update({ read: true }).eq("user_id", user.id)
    return NextResponse.json({ status: "ok" })
  }

  if (body.action === "read_one") {
    await supabaseAdmin.from("notifications").update({ read: true }).eq("id", body.notification_id)
    return NextResponse.json({ status: "ok" })
  }

  return NextResponse.json({ detail: "Acao invalida" }, { status: 400 })
}
