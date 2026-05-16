import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid user session" }, { status: 401 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email || undefined,
      line_items: [
        {
          price: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID!,
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        plan: "business",
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan: "business",
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true&plan=business`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 }
    )
  }
}
