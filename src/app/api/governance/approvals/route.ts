import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { evaluateExecutionPolicy } from "@/lib/policies/execution-policy"
import { QUEUE_STATUS } from "@/lib/queue/status";

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(req: NextRequest) {
  const workspaceId = req.nextUrl.searchParams.get("workspaceId")

  if (!workspaceId) {
    return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 })
  }

  const result = await supabase
    .from("ai_approval_requests")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(100)

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 })
  }

  return NextResponse.json({ approvals: result.data || [] })
}

export async function POST(req: NextRequest) {
  try {
    const {
      workspaceId,
      title,
      category = "operations",
      priority = "medium",
      actionType = "recommendation",
      source = "decision_engine",
      confidence = 70,
      payload = {},
    } = await req.json()

    if (!workspaceId || !title) {
      return NextResponse.json(
        { error: "Missing workspaceId or title" },
        { status: 400 }
      )
    }

    const decision = evaluateExecutionPolicy({
      title,
      category,
      priority,
      actionType,
      source,
      confidence,
    })

    const result = await supabase
      .from("ai_approval_requests")
      .insert({
        workspace_id: workspaceId,
        title,
        category,
        priority,
        action_type: actionType,
        source,
        confidence,
        decision,
        payload,
        status:
          decision.outcome === "auto_execute"
            ? "approved"
            : decision.outcome === "blocked"
              ? "blocked"
              : QUEUE_STATUS.PENDING,
      })
      .select("*")
      .single()

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ approval: result.data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create approval request" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { approvalId, status, reviewedBy = "workspace_admin" } = await req.json()

    if (!approvalId || !["approved", "rejected", "blocked"].includes(status)) {
      return NextResponse.json(
        { error: "Missing approvalId or invalid status" },
        { status: 400 }
      )
    }

    const result = await supabase
      .from("ai_approval_requests")
      .update({
        status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", approvalId)
      .select("*")
      .single()

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ approval: result.data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update approval request" },
      { status: 500 }
    )
  }
}