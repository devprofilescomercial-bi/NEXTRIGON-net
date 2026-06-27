import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { MercadoPagoConfig, Payment, PreApproval } from "mercadopago"

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
})

const PLANOS_MP: Record<string, { valor: number; nome: string }> = {
  pro: { valor: 49.0, nome: "Nextrigon Pro - Mensal" },
  elite: { valor: 129.0, nome: "Nextrigon Elite - Mensal" },
}

async function authUser(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  return session?.user ?? null
}

export async function POST(req: NextRequest) {
  const { pathname } = new URL(req.url)
  const body = await req.json().catch(() => ({}))

  // Webhook — só confirma recebimento
  if (pathname === "/api/mercadopago/webhook") {
    return NextResponse.json({ ok: true })
  }

  const user = await authUser(req)
  if (!user) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })
  const userId = user.id
  const userEmail = user.email || ""

  // PIX avulso
  if (pathname === "/api/mercadopago/pix") {
    const { plan_id } = body
    const plano = PLANOS_MP[plan_id]
    if (!plano) return NextResponse.json({ detail: "Plano inválido" }, { status: 400 })

    const paymentApi = new Payment(mp)
    const payment = await paymentApi.create({
      body: {
        transaction_amount: plano.valor,
        description: plano.nome,
        payment_method_id: "pix",
        payer: { email: userEmail },
        metadata: { user_id: userId, plan_id },
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/webhook`,
      },
    })

    return NextResponse.json({
      payment_id: payment.id,
      status: payment.status,
      qr_code: payment.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
      ticket_url: payment.point_of_interaction?.transaction_data?.ticket_url,
    })
  }

  // Assinatura recorrente
  if (pathname === "/api/mercadopago/assinatura") {
    const { plan_id, back_url } = body
    const plano = PLANOS_MP[plan_id]
    if (!plano) return NextResponse.json({ detail: "Plano inválido" }, { status: 400 })

    const preApprovalApi = new PreApproval(mp)
    const sub = await preApprovalApi.create({
      body: {
        reason: plano.nome,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: plano.valor,
          currency_id: "BRL",
        },
        payer_email: userEmail,
        back_url: back_url || `${process.env.NEXT_PUBLIC_APP_URL}/perfil/carteira`,
        external_reference: `${userId}:${plan_id}`,
      } as any,
    })

    return NextResponse.json({
      subscription_id: sub.id,
      status: sub.status,
      init_point: sub.init_point,
    })
  }

  return NextResponse.json({ detail: "Rota não encontrada" }, { status: 404 })
}
