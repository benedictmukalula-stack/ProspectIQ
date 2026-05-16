import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { canAccessFeature, type FeatureKey } from "@/lib/features/feature-gates"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { userId, feature } = await req.json() as {
      userId?: string
      feature?: FeatureKey
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
