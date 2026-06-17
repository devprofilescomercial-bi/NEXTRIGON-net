import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe-server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "") || ""
  if (!token) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return NextResponse.json({ detail: "Nao autenticado" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { plan_id } = body

  if (!plan_id || !["pro", "elite"].includes(plan_id)) {
    return NextResponse.json({ detail: "Plano invalido" }, { status: 400 })
  }

  const stripe = getStripe()
  const prices: Record<string, number> = { pro: 4900, elite: 12900 }
  const names: Record<string, string> = { pro: "Pro", elite: "Elite" }

  let priceId = process.env[`STRIPE_PRICE_${plan_id.toUpperCase()}`]

  if (!priceId) {
    const product = await stripe.products.create({
      name: `Nextrigon ${names[plan_id]}`,
      description: `Plano ${names[plan_id]} - Assinatura mensal`,
    })
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: prices[plan_id],
      currency: "brl",
      recurring: { interval: "month" },
    })
    priceId = price.id
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email || undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    payment_method_types: ["card", "boleto", "pix"],
    payment_method_options: {
      boleto: { expires_after_days: 3 },
    },
    metadata: { user_id: user.id, plan_id },
    subscription_data: {
      metadata: { user_id: user.id, plan_id },
    },
    success_url: `${req.headers.get("origin") || "https://nextrigon-net.netlify.app"}/app/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.get("origin") || "https://nextrigon-net.netlify.app"}/app/payment/cancel`,
    locale: "pt-BR",
  })

  return NextResponse.json({ url: session.url, session_id: session.id })
}
