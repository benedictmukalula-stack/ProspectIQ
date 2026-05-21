import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { meterWorkspaceUsage } from "@/lib/commercial/usage-metering-engine"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get("workspaceId")
    const plan =
      (searchParams.get("plan") as "free" | "pro" | "business" | "enterprise") ||
      "business"

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: "Missing workspaceId" },
        { status: 400 }
      )
    }

    const [leadsResult, queueResult, activityResult] = await Promise.all([
      supabaseAdmin
        .from("crm_contacts")
        .select("id")
        .eq("workspace_id", workspaceId),

      supabaseAdmin
        .from("outbound_send_queue")
        .select("id,status")
        .eq("workspace_id", workspaceId),

      supabaseAdmin
        .from("activity_events")
        .select("id,type")
        .eq("workspace_id", workspaceId),
    ])

    if (leadsResult.error) throw new Error(leadsResult.error.message)
    if (queueResult.error) throw new Error(queueResult.error.message)

    const activityEvents = activityResult.error ? [] : activityResult.data || []

    const aiActions = activityEvents.filter((event) =>
      String(event.type || "").includes("ai")
    ).length

    const autonomousRuns = activityEvents.filter((event) =>
      String(event.type || "").includes("autonomous")
    ).length

    const simulations = activityEvents.filter((event) =>
      String(event.type || "").includes("simulation")
    ).length

    const sent = (queueResult.data || []).filter(
      (item) => item.status === "sent"
    ).length

    const metering = meterWorkspaceUsage({
      plan,
      signals: {
        leads: leadsResult.data?.length || 0,
        sent,
        aiActions,
        autonomousRuns,
        simulations,
      },
    })

    return NextResponse.json({
      success: true,
      workspaceId,
      metering,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Commercial usage metering failed",
      },
      { status: 500 }
    )
  }
}
