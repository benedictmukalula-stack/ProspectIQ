import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST() {
  try {
    if (!process.env.STRIPE_TEST_CUSTOMER_ID) {
      throw new Error("Missing STRIPE_TEST_CUSTOMER_ID")
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: process.env.STRIPE_TEST_CUSTOMER_ID,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe portal error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create billing portal session",
      },
      { status: 500 }
    )
  }
}
