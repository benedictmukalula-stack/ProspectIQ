import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { PLAN_LIMITS, type Plan, type UsageEventType } from "@/lib/billing/entitlements"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userId = body.userId as string | undefined
    const eventType = body.eventType as UsageEventType | undefined
    const quantity = Number(body.quantity || 1)
    const metadata = body.metadata || {}

    if (!userId || !eventType) {
      return NextResponse.json(
        { error: "Missing userId or eventType" },
        { status: 400 }
      )
    }

    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("plan,status")
      .eq("user_id", userId)
      .in("status", ["active", "trialing"])
      .order("created_at", { ascending: false })
      .maybeSingle()

    const plan = ((subscription?.plan as Plan) || "free") as Plan
    const limit = PLAN_LIMITS[plan]?.[eventType] ?? 0

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const { data: usageRows, error: usageError } = await supabaseAdmin
      .from("usage_events")
      .select("quantity")
      .eq("user_id", userId)
      .eq("event_type", eventType)
      .gte("created_at", monthStart.toISOString())

    if (usageError) throw new Error(usageError.message)

    const used = usageRows?.reduce((sum, row) => sum + Number(row.quantity || 0), 0) || 0

    if (used + quantity > limit) {
      return NextResponse.json(
        {
          allowed: false,
          plan,
          eventType,
          used,
          limit,
          error: "Usage limit reached",
        },
        { status: 403 }
      )
    }

    const { error: insertError } = await supabaseAdmin.from("usage_events").insert({
      user_id: userId,
      event_type: eventType,
      quantity,
      metadata,
    })

    if (insertError) throw new Error(insertError.message)

    return NextResponse.json({
      allowed: true,
      plan,
      eventType,
      used: used + quantity,
      limit,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Usage tracking failed" },
      { status: 500 }
    )
  }
}
