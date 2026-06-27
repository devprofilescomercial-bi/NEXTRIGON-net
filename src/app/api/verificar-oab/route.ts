import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { verificarOAB } from "@/lib/oab-verificacao"

async function authUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") || ""
  if (!token) return null
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return null
  return user.id
}

export async function POST(req: NextRequest) {
  const userId = await authUser(req)
  if (!userId) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { oab_numero, oab_uf } = body

  if (!oab_numero || !oab_uf) {
    return NextResponse.json({ detail: "oab_numero e oab_uf sao obrigatorios" }, { status: 400 })
  }

  const resultado = await verificarOAB(oab_numero, oab_uf)

  if (!resultado.encontrado) {
    return NextResponse.json({
      valido: false,
      mensagem: resultado.erro || "OAB não encontrada no CNA. Verifique o número e o estado.",
    })
  }

  // Advogado suspenso ou cancelado — não aprova
  const situacao = (resultado.situacao || "").toLowerCase()
  if (situacao.includes("suspen") || situacao.includes("cancel")) {
    return NextResponse.json({
      valido: false,
      mensagem: `Inscrição OAB com situação: ${resultado.situacao}. Apenas inscrições ativas são aceitas.`,
      situacao: resultado.situacao,
    })
  }

  // Aprovação automática — atualiza perfil e verificação
  await supabaseAdmin.from("profiles").update({
    oab_numero,
    oab_uf: oab_uf.toUpperCase(),
    oab_verified: true,
  }).eq("user_id", userId)

  // Upsert na tabela de verificações
  const { data: existing } = await supabaseAdmin
    .from("verifications")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle()

  if (existing) {
    await supabaseAdmin.from("verifications").update({
      oab_numero,
      oab_uf: oab_uf.toUpperCase(),
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: "sistema-cna",
    }).eq("user_id", userId)
  } else {
    await supabaseAdmin.from("verifications").insert({
      user_id: userId,
      oab_numero,
      oab_uf: oab_uf.toUpperCase(),
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: "sistema-cna",
    })
  }

  // Notifica o usuário
  await supabaseAdmin.from("notifications").insert({
    user_id: userId,
    type: "verificacao",
    title: "OAB verificada com sucesso!",
    message: `Sua inscrição OAB ${oab_numero}/${oab_uf.toUpperCase()} foi verificada automaticamente. Seu perfil agora exibe o selo de advogado verificado.`,
    cta_text: "Ver perfil",
    cta_link: "/app/perfil",
  })

  return NextResponse.json({
    valido: true,
    nome: resultado.nome,
    inscricao: resultado.inscricao,
    situacao: resultado.situacao,
    tipo: resultado.tipo,
    uf: resultado.uf,
    mensagem: "OAB verificada com sucesso!",
  })
}
