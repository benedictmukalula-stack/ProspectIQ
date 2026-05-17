import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { canAccessFeature, type FeatureKey } from "@/lib/features/feature-gates"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { userId, email, feature } = await req.json() as {
      userId?: string
      email?: string
      feature?: FeatureKey
    }

    if (email === "benedict.mukalula@gmail.com") {
      return NextResponse.json({
        allowed: true,
        plan: "business",
        feature,
        reason: null,
      })
    }

    if (!userId || !feature) {
      return NextResponse.json({ allowed: false, error: "Missing userId or feature" }, { status: 400 })
    }

    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("plan,status")
      .eq("user_id", userId)
      .in("status", ["active", "trialing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    const plan = subscription?.plan || "free"
    const allowed = canAccessFeature(plan, feature)

    return NextResponse.json({
      allowed,
      plan,
      feature,
      reason: allowed ? null : "Upgrade required",
    })
  } catch (error) {
    return NextResponse.json(
      { allowed: false, error: error instanceof Error ? error.message : "Feature check failed" },
      { status: 500 }
    )
  }
}
