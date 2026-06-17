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

  const { data } = await supabaseAdmin.from("user_financial_stats").select("*").eq("user_id", user.id).order("ano", { ascending: false }).order("mes", { ascending: false }).limit(12)

  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const user = await authUser(req)
  if (!user) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const now = new Date()
  const mes = now.getMonth() + 1
  const ano = now.getFullYear()

  const { data: existing } = await supabaseAdmin.from("user_financial_stats").select("*").eq("user_id", user.id).eq("mes", mes).eq("ano", ano).maybeSingle()

  if (existing) {
    await supabaseAdmin.from("user_financial_stats").update({
      conexoes: body.conexoes ?? existing.conexoes,
      parcerias_fechadas: body.parcerias_fechadas ?? existing.parcerias_fechadas,
      honorarios_receita: body.honorarios_receita ?? existing.honorarios_receita,
      oportunidades_recebidas: body.oportunidades_recebidas ?? existing.oportunidades_recebidas,
      valor_negociacao: body.valor_negociacao ?? existing.valor_negociacao,
      updated_at: new Date().toISOString(),
    }).eq("id", existing.id)
  } else {
    await supabaseAdmin.from("user_financial_stats").insert({
      user_id: user.id, mes, ano,
      conexoes: body.conexoes || 0,
      parcerias_fechadas: body.parcerias_fechadas || 0,
      honorarios_receita: body.honorarios_receita || 0,
      oportunidades_recebidas: body.oportunidades_recebidas || 0,
      valor_negociacao: body.valor_negociacao || 0,
    })
  }

  return NextResponse.json({ status: "ok" })
}
