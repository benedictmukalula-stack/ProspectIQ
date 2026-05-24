import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { runMultiAgentRevenueSystem } from "../lib/agents/revenue/multi-agent-revenue-system"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get("workspaceId")

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: "Missing workspaceId" },
        { status: 400 }
      )
    }

    const { data: leads, error: leadsError } = await supabaseAdmin
      .from("crm_contacts")
      .select(
        "id,email,first_name,last_name,title,lead_score,hot_lead,lifecycle_stage"
      )
      .eq("workspace_id", workspaceId)

    if (leadsError) {
      throw new Error(leadsError.message)
    }

    const { data: queue, error: queueError } = await supabaseAdmin
      .from("outbound_send_queue")
      .select("id,status,contact_id")
      .eq("workspace_id", workspaceId)

    if (queueError) {
      throw new Error(queueError.message)
    }

    const result = runMultiAgentRevenueSystem({
      leads: leads || [],
      queue: queue || [],
    })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Revenue agent system failed",
      },
      { status: 500 }
    )
  }
}
