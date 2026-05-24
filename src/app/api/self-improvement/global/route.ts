import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { generatePlatformIntelligenceMesh } from "../lib/global-intelligence/platform-intelligence-mesh"
import { generateSelfImprovementDirectives } from "../lib/self-improvement/self-improving-optimizer"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const [leadsResult, companiesResult, engagementResult, queueResult] =
      await Promise.all([
        supabaseAdmin
          .from("crm_contacts")
          .select("id,workspace_id,lifecycle_stage,lead_score,hot_lead"),

        supabaseAdmin
          .from("crm_companies")
          .select("id,workspace_id,industry"),

        supabaseAdmin
          .from("engagement_events")
          .select("workspace_id,event_type"),

        supabaseAdmin
          .from("outbound_send_queue")
          .select("workspace_id,status"),
      ])

    if (leadsResult.error) throw new Error(leadsResult.error.message)
    if (companiesResult.error) throw new Error(companiesResult.error.message)
    if (engagementResult.error) throw new Error(engagementResult.error.message)
    if (queueResult.error) throw new Error(queueResult.error.message)

    const mesh = generatePlatformIntelligenceMesh({
      leads: leadsResult.data || [],
      companies: companiesResult.data || [],
      engagementEvents: engagementResult.data || [],
      queue: queueResult.data || [],
    })

    const selfImprovement = generateSelfImprovementDirectives(mesh)

    return NextResponse.json({
      success: true,
      mesh: mesh.summary,
      industryBenchmarks: mesh.industryBenchmarks,
      selfImprovement,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Self-improvement engine failed",
      },
      { status: 500 }
    )
  }
}
