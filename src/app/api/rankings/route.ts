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

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type") || "geral"

  let query = supabaseAdmin.from("profiles").select("user_id, nome, foto, areas_atuacao, nota, avaliacoes, taxa_resposta, cidade, uf, oab_verified")

  if (type === "semana") {
    query = query.order("nota", { ascending: false }).limit(10)
  } else if (type === "taxa_resposta") {
    query = query.not("taxa_resposta", "is", null).order("taxa_resposta", { ascending: false }).limit(10)
  } else if (type === "avaliados") {
    query = query.order("avaliacoes", { ascending: false }).limit(10)
  } else {
    query = query.order("nota", { ascending: false }).limit(10)
  }

  const { data } = await query
  return NextResponse.json(data || [])
}
