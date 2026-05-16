import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userId = body.userId as string | undefined

    if (!userId) {
      return NextResponse.json({
        plan: "free",
        status: "inactive",
        current_period_end: null,
      })
    }

    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .select("plan,status,current_period_end,stripe_customer_id,stripe_subscription_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw new Error(error.message)

    return NextResponse.json(
      data || {
        plan: "free",
        status: "inactive",
        current_period_end: null,
      }
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load plan" },
      { status: 500 }
    )
  }
}
