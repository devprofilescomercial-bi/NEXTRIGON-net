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

  const profileRes = await supabaseAdmin.from("profiles").select("*").eq("user_id", user.id).single()
  const profile = profileRes.data
  if (!profile) return NextResponse.json({ detail: "Perfil nao encontrado" }, { status: 404 })

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [views7d, swipes30d, subRes] = await Promise.all([
    supabaseAdmin.from("profile_views").select("*", { count: "exact", head: true }).eq("target_id", user.id).gte("created_at", sevenDaysAgo),
    supabaseAdmin.from("swipes").select("*", { count: "exact", head: true }).eq("to_user", user.id).eq("direction", "like").gte("created_at", thirtyDaysAgo),
    supabaseAdmin.from("subscriptions").select("plan_id").eq("user_id", user.id).maybeSingle(),
  ])

  const badges: { id: string; label: string; icon: string }[] = []

  if ((views7d.count || 0) >= 10) {
    badges.push({ id: "alta", label: "Perfil em alta", icon: "🔥" })
  }

  if ((swipes30d.count || 0) >= 5) {
    badges.push({ id: "crescimento", label: "Profissional em crescimento", icon: "📈" })
  }

  if (profile.oab_verified || profile.facial_verified) {
    badges.push({ id: "verificado", label: "Perfil verificado", icon: "✅" })
  }

  const planId = subRes.data?.plan_id || "free"
  if (planId === "elite") {
    badges.push({ id: "autoridade", label: "Selo de autoridade", icon: "👑" })
  }

  return NextResponse.json(badges)
}
