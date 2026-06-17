import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getPlan, BOOST_OPTIONS } from "@/lib/plans"

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

  const [activeRes, subRes] = await Promise.all([
    supabaseAdmin.from("boost_activations").select("*").eq("user_id", user.id).gt("expires_at", new Date().toISOString()).order("expires_at", { ascending: false }).limit(1).maybeSingle(),
    supabaseAdmin.from("subscriptions").select("boosts_remaining, plan_id").eq("user_id", user.id).maybeSingle(),
  ])

  const plan = getPlan(subRes.data?.plan_id || "free")

  return NextResponse.json({
    active: !!activeRes.data && new Date(activeRes.data.expires_at) > new Date(),
    expires_at: activeRes.data?.expires_at || null,
    boosts_remaining: subRes.data?.boosts_remaining || 0,
    boosts_mensais_plano: plan.boosts_mensais,
    options: BOOST_OPTIONS,
  })
}

export async function POST(req: NextRequest) {
  const user = await authUser(req)
  if (!user) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const action = body.action

  if (action === "activate") {
    const { data: sub } = await supabaseAdmin.from("subscriptions").select("boosts_remaining").eq("user_id", user.id).single()
    if (!sub || sub.boosts_remaining < 1) return NextResponse.json({ detail: "Sem boosts disponiveis" }, { status: 400 })

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    await Promise.all([
      supabaseAdmin.from("boost_activations").insert({ user_id: user.id, expires_at: expiresAt, source: body.source || "subscription" }),
      supabaseAdmin.from("subscriptions").update({ boosts_remaining: sub.boosts_remaining - 1 }).eq("user_id", user.id),
      supabaseAdmin.from("profiles").update({ boost_active_until: expiresAt }).eq("user_id", user.id),
    ])

    return NextResponse.json({ status: "ok", expires_at: expiresAt })
  }

  if (action === "purchase") {
    const qty = body.quantidade
    const option = BOOST_OPTIONS.find((o) => o.quantidade === qty)
    if (!option) return NextResponse.json({ detail: "Quantidade invalida" }, { status: 400 })

    const { data: sub } = await supabaseAdmin.from("subscriptions").select("boosts_remaining").eq("user_id", user.id).single()
    const boostsAtuais = sub?.boosts_remaining || 0

    await supabaseAdmin.from("subscriptions").update({
      boosts_remaining: boostsAtuais + qty,
    }).eq("user_id", user.id)

    return NextResponse.json({
      status: "purchased",
      quantidade: qty,
      preco: option.preco,
      boosts_remaining: boostsAtuais + qty,
    })
  }

  return NextResponse.json({ detail: "Acao invalida" }, { status: 400 })
}
