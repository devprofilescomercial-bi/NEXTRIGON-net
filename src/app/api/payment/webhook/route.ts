import { NextRequest, NextResponse } from "next/server"
import { getStripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe-server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature") || ""

  if (!STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  const stripe = getStripe()
  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object
      const userId = session.metadata?.user_id
      const planId = session.metadata?.plan_id
      const stripeSubId = session.subscription
      const stripeCustomerId = session.customer

      if (userId && planId) {
        const { data: plan } = await supabaseAdmin
          .from("subscription_plans")
          .select("*")
          .eq("id", planId)
          .single()

        await supabaseAdmin
          .from("subscriptions")
          .update({
            plan_id: planId,
            status: "active",
            stripe_customer_id: stripeCustomerId as string,
            stripe_subscription_id: stripeSubId as string,
            boosts_remaining: plan?.boosts_mensais || 0,
            matches_used_this_month: 0,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
      }
      break
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as any
      const stripeSubId = invoice.subscription

      if (stripeSubId) {
        const { data: subs } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", stripeSubId)
          .maybeSingle()

        if (subs?.user_id) {
          await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "active",
              current_period_end: new Date((invoice.period_end || 0) * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", subs.user_id)
        }
      }
      break
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object
      const uid = sub.metadata?.user_id
      if (uid) {
        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: event.type === "customer.subscription.deleted" ? "canceled" : sub.status,
            cancel_at_period_end: sub.cancel_at_period_end || false,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", uid)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}

export const config = {
  api: { bodyParser: false },
}
