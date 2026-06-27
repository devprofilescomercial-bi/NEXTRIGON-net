import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { MercadoPagoConfig, Payment, PreApproval } from "mercadopago"

const mp = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
})

const PLANOS_MP: Record<string, { valor: number; nome: string; preapproval_plan_id?: string }> = {
  pro: { valor: 49.0, nome: "Nextrigon Pro - Mensal", preapproval_plan_id: process.env.MP_PLAN_PRO_ID },
  elite: { valor: 129.0, nome: "Nextrigon Elite - Mensal", preapproval_plan_id: process.env.MP_PLAN_ELITE_ID },
}

async function authUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") || ""
  if (!token) return null
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return null
  return user
}

// POST /api/mercadopago/pix  — gera cobrança PIX avulsa (boost ou plano mensal)
// POST /api/mercadopago/assinatura  — cria assinatura recorrente
// POST /api/mercadopago/webhook  — recebe notificações do MP

export async function POST(req: NextRequest) {
  const { pathname } = new URL(req.url)
  const body = await req.json().catch(() => ({}))

  // ── Webhook ────────────────────────────────────────────────────────────────
  if (pathname === "/api/mercadopago/webhook") {
    const { type, data } = body
    if (type === "payment") {
      try {
        const paymentApi = new Payment(mp)
        const payment = await paymentApi.get({ id: data.id })
        if (payment.status === "approved") {
          const meta = payment.metadata as Record<string, string> | undefined
          const userId = meta?.user_id
          const planId = meta?.plan_id
          if (userId && planId) {
            const now = new Date()
            const end = new Date(now)
            end.setMonth(end.getMonth() + 1)
            await supabaseAdmin.from("subscriptions").upsert({
              user_id: userId,
              plan_id: planId,
              status: "active",
              current_period_start: now.toISOString(),
              current_period_end: end.toISOString(),
              mp_payment_id: String(payment.id),
            }, { onConflict: "user_id" })
            await supabaseAdmin.from("notifications").insert({
              user_id: userId,
              type: "pagamento",
              title: "Pagamento confirmado!",
              message: `Seu plano ${planId.toUpperCase()} foi ativado com sucesso.`,
              cta_text: "Ver planos",
              cta_link: "/app/dashboard",
            })
          }
        }
      } catch {}
    }
    if (type === "preapproval") {
      // Assinatura recorrente aprovada/cancelada — external_reference carrega userId:planId
      try {
        const preApprovalApi = new PreApproval(mp)
        const sub = await preApprovalApi.get({ id: data.id })
        const ref = (sub as any).external_reference as string | undefined
        const [userId, planId] = (ref || "").split(":")
        if (userId && planId) {
          const status = sub.status === "authorized" ? "active" : "cancelled"
          await supabaseAdmin.from("subscriptions").upsert({
            user_id: userId,
            plan_id: status === "active" ? planId : "free",
            status,
            mp_subscription_id: String(sub.id),
          }, { onConflict: "user_id" })
        }
      } catch {}
    }
    return NextResponse.json({ ok: true })
  }

  const user = await authUser(req)
  if (!user) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })
  const userId = user.id
  const userEmail = user.email || ""

  // ── PIX avulso ─────────────────────────────────────────────────────────────
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

  // ── Assinatura recorrente ───────────────────────────────────────────────────
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
        back_url: back_url || `${process.env.NEXT_PUBLIC_APP_URL}/app/dashboard`,
        external_reference: `${userId}:${plan_id}`,
      } as any,
    })

    return NextResponse.json({
      subscription_id: sub.id,
      status: sub.status,
      init_point: sub.init_point,
    })
  }

  // ── Cancelar assinatura ────────────────────────────────────────────────────
  if (pathname === "/api/mercadopago/cancelar") {
    const { data: currentSub } = await supabaseAdmin
      .from("subscriptions")
      .select("mp_subscription_id")
      .eq("user_id", userId)
      .maybeSingle()

    if (currentSub?.mp_subscription_id) {
      const preApprovalApi = new PreApproval(mp)
      await preApprovalApi.update({
        id: currentSub.mp_subscription_id,
        body: { status: "cancelled" },
      })
    }
    await supabaseAdmin.from("subscriptions").update({
      plan_id: "free",
      status: "cancelled",
    }).eq("user_id", userId)

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ detail: "Rota não encontrada" }, { status: 404 })
}
