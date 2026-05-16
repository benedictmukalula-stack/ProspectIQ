import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getPlanFromPrice(priceId?: string | null) {
  if (!priceId) return "free"

  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) return "pro"
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID) return "business"

  return "unknown"
}

export async function POST(req: Request) {
  console.log("Webhook route hit")

  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error("Webhook signature error:", error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid signature" },
      { status: 400 }
    )
  }

  console.log("Stripe event type:", event.type)

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      const customerId = session.customer as string | null
      const subscriptionId = session.subscription as string | null
      let userId = session.metadata?.user_id || null

      console.log("Checkout session:", { customerId, subscriptionId, userId })

      if (!customerId || !subscriptionId) {
        console.log("Missing customer or subscription on checkout session")
        return NextResponse.json({ received: true })
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      userId = userId || subscription.metadata?.user_id || null
      const priceId = subscription.items.data[0]?.price.id
      const plan = getPlanFromPrice(priceId)

      console.log("Syncing subscription:", {
        customerId,
        subscriptionId,
        priceId,
        plan,
        status: subscription.status,
      })

      const { error } = await supabaseAdmin.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          stripe_price_id: priceId,
          plan,
          status: subscription.status,
          current_period_end: new Date(
            Number((subscription as any).current_period_end || 0) * 1000
          ).toISOString(),
        },
        { onConflict: "stripe_subscription_id" }
      )

      if (error) {
        console.error("Supabase upsert error:", error)
        throw new Error(error.message)
      }

      console.log("Subscription synced successfully")
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription
      const priceId = subscription.items.data[0]?.price.id
      const plan =
        subscription.status === "canceled" ? "free" : getPlanFromPrice(priceId)

      console.log("Updating subscription:", {
        subscriptionId: subscription.id,
        priceId,
        plan,
        status: subscription.status,
      })

      const { error } = await supabaseAdmin
        .from("subscriptions")
        .update({
          stripe_price_id: priceId,
          plan,
          status: subscription.status,
          current_period_end: new Date(
            Number((subscription as any).current_period_end || 0) * 1000
          ).toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id)

      if (error) {
        console.error("Supabase update error:", error)
        throw new Error(error.message)
      }

      console.log("Subscription updated successfully")
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook failed" },
      { status: 500 }
    )
  }
}
