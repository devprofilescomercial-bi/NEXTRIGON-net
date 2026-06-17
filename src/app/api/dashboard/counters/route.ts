import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getPlan } from "@/lib/plans"

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

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [viewsRes, likesRes, swipesRes, subRes, profileRes] = await Promise.all([
    supabaseAdmin.from("profile_views").select("*", { count: "exact", head: true }).eq("target_id", user.id).gte("created_at", sevenDaysAgo),
    supabaseAdmin.from("swipes").select("*", { count: "exact", head: true }).eq("to_user", user.id).eq("direction", "like").gte("created_at", sevenDaysAgo),
    supabaseAdmin.from("swipes").select("*", { count: "exact", head: true }).eq("from_user", user.id).gte("created_at", thisMonthStart),
    supabaseAdmin.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
    supabaseAdmin.from("profiles").select("boost_active_until").eq("user_id", user.id).single(),
  ])

  const planId = subRes.data?.plan_id || "free"
  const plan = getPlan(planId)
  const matchesUsed = (subRes.data as any)?.matches_used_this_month || 0
  const matchesRestantes = Math.max(0, plan.matches_mensais - matchesUsed)

  return NextResponse.json({
    oportunidades_semana: swipesRes.count || 0,
    interesses_recebidos: likesRes.count || 0,
    visualizacoes_perfil: viewsRes.count || 0,
    matches_restantes: matchesRestantes,
    plan_id: planId,
    plan_nome: plan.nome,
    matches_used: matchesUsed,
    matches_limit: plan.matches_mensais,
    boost_active: profileRes.data?.boost_active_until && new Date(profileRes.data.boost_active_until as string) > new Date(),
  })
}
