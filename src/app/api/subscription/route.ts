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

  const { data: sub } = await supabaseAdmin.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle()

  if (!sub) {
    const { data: newSub } = await supabaseAdmin.from("subscriptions").insert({ user_id: user.id, plan_id: "free" }).select().single()
    return NextResponse.json(newSub)
  }

  const { data: plan } = await supabaseAdmin.from("subscription_plans").select("*").eq("id", sub.plan_id).single()

  return NextResponse.json({ ...sub, plan })
}

export async function POST(req: NextRequest) {
  const user = await authUser(req)
  if (!user) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const action = body.action

  if (action === "upgrade") {
    const planId = body.plan_id
    const { data: plan } = await supabaseAdmin.from("subscription_plans").select("*").eq("id", planId).single()
    if (!plan) return NextResponse.json({ detail: "Plano invalido" }, { status: 400 })

    const { data: sub } = await supabaseAdmin.from("subscriptions").update({
      plan_id: planId,
      status: "active",
      boosts_remaining: plan.boosts_mensais,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("user_id", user.id).select().single()

    return NextResponse.json({ status: "ok", subscription: sub })
  }

  if (action === "cancel") {
    await supabaseAdmin.from("subscriptions").update({
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    }).eq("user_id", user.id)

    return NextResponse.json({ status: "canceled" })
  }

  if (action === "reinstate") {
    await supabaseAdmin.from("subscriptions").update({
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    }).eq("user_id", user.id)

    return NextResponse.json({ status: "reinstated" })
  }

  return NextResponse.json({ detail: "Acao invalida" }, { status: 400 })
}
