import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe-server"

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY nao configurada. Crie uma conta em https://dashboard.stripe.com e adicione a chave nas env vars do Netlify." },
      { status: 400 }
    )
  }

  const stripe = getStripe()
  const plans = [
    { id: "pro", nome: "Nextrigon Pro", descricao: "Plano Pro - Assinatura mensal", preco: 4900 },
    { id: "elite", nome: "Nextrigon Elite", descricao: "Plano Elite - Assinatura mensal", preco: 12900 },
  ]

  const results: Record<string, string> = {}

  for (const plan of plans) {
    if (process.env[`STRIPE_PRICE_${plan.id.toUpperCase()}`]) {
      results[plan.id] = `ja configurado: ${process.env[`STRIPE_PRICE_${plan.id.toUpperCase()}`]}`
      continue
    }

    const product = await stripe.products.create({
      name: plan.nome,
      description: plan.descricao,
    })

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.preco,
      currency: "brl",
      recurring: { interval: "month" },
    })

    results[plan.id] = price.id
  }

  return NextResponse.json({
    message: "Produtos criados no Stripe. Copie os Price IDs abaixo e adicione como env vars no Netlify (NAO em netlify.toml):",
    prices: results,
  })
}
