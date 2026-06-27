import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { oabVerification } from "@/db/schema"
import { verificarOAB } from "@/lib/oab-verificacao"
import { eq } from "drizzle-orm"

async function authUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  return session?.user ?? null
}

export async function POST(req: NextRequest) {
  const user = await authUser(req)
  if (!user) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })

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

  const situacao = (resultado.situacao || "").toLowerCase()
  if (situacao.includes("suspen") || situacao.includes("cancel")) {
    return NextResponse.json({
      valido: false,
      mensagem: `Inscrição OAB com situação: ${resultado.situacao}. Apenas inscrições ativas são aceitas.`,
      situacao: resultado.situacao,
    })
  }

  // Salva/atualiza verificação no banco
  const existing = await db
    .select()
    .from(oabVerification)
    .where(eq(oabVerification.userId, user.id))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(oabVerification)
      .set({
        oabNumber: oab_numero,
        oabUf: oab_uf.toUpperCase(),
        status: "approved",
        reviewedAt: new Date(),
        reviewedBy: "sistema-cna",
      })
      .where(eq(oabVerification.userId, user.id))
  } else {
    await db.insert(oabVerification).values({
      userId: user.id,
      oabNumber: oab_numero,
      oabUf: oab_uf.toUpperCase(),
      status: "approved",
      reviewedAt: new Date(),
      reviewedBy: "sistema-cna",
    })
  }

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
