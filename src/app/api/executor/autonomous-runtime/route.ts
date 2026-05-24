import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { generateStrategicMemory } from "../lib/memory/strategic-memory"
import { generateSequenceLearningRules } from "../lib/learning/sequence-learning-engine"
import { generateAutonomousOptimizationPlan } from "../lib/optimization/autonomous-optimizer"
import { generateExecutionPolicy } from "../lib/orchestration/autonomous-execution-orchestrator"
import { createWorkspaceAutonomousPolicy } from "../lib/policies/persistent-policy-engine"
import { enforceRuntimePolicy } from "../lib/runtime/runtime-policy-enforcer"
import { executeAutonomousRuntime } from "../lib/executor/autonomous-runtime-executor"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { workspaceId } = await req.json()

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: "Missing workspaceId" },
        { status: 400 }
      )
    }

    const [leadsResult, companiesResult, engagementResult, queueResult] =
      await Promise.all([
        supabaseAdmin
          .from("crm_contacts")
          .select("id,lead_score,lifecycle_stage,hot_lead,title")
          .eq("workspace_id", workspaceId),

        supabaseAdmin
          .from("crm_companies")
          .select("id,industry")
          .eq("workspace_id", workspaceId),

        supabaseAdmin
          .from("engagement_events")
          .select("event_type")
          .eq("workspace_id", workspaceId),

        supabaseAdmin
          .from("outbound_send_queue")
          .select("status")
          .eq("workspace_id", workspaceId),
      ])

    if (leadsResult.error) throw new Error(leadsResult.error.message)
    if (companiesResult.error) throw new Error(companiesResult.error.message)
    if (engagementResult.error) throw new Error(engagementResult.error.message)
    if (queueResult.error) throw new Error(queueResult.error.message)

    const memory = generateStrategicMemory({
      leads: leadsResult.data || [],
      companies: companiesResult.data || [],
      engagementEvents: engagementResult.data || [],
      queue: queueResult.data || [],
    })

    const learning = generateSequenceLearningRules(memory)

    const optimization = generateAutonomousOptimizationPlan({
      rules: learning.rules,
      dominantIndustry: learning.summary.dominantIndustry,
      failureRate: learning.summary.failureRate,
    })

    const executionPolicy = generateExecutionPolicy(optimization)

    const workspacePolicy = createWorkspaceAutonomousPolicy({
      workspaceId,
      policy: executionPolicy,
    })

    const enforcement = enforceRuntimePolicy(workspacePolicy)

    const execution = await executeAutonomousRuntime({
      workspaceId,
      enforcement,
      supabase: supabaseAdmin,
    })

    return NextResponse.json({
      success: execution.success,
      workspaceId,
      enforcement,
      execution,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Autonomous runtime executor failed",
      },
      { status: 500 }
    )
  }
}
