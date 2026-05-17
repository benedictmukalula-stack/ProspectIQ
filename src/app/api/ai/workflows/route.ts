import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DEFAULT_WORKFLOWS = [
  {
    name: "Lead Qualification Assistant",
    description: "Scores contacts based on title, company, source, and intent signals.",
    action_type: "lead_score",
    prompt_template:
      "Analyze this lead and return a score from 0-100 with recommended next action.",
    status: "active",
  },
  {
    name: "Outbound Email Drafting",
    description: "Generates personalized outreach emails for qualified contacts.",
    action_type: "email_draft",
    prompt_template:
      "Write a concise B2B outreach email using the contact and company context.",
    status: "draft",
  },
]

export async function POST(req: Request) {
  try {
    const { workspaceId } = await req.json()

    if (!workspaceId) {
      return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 })
    }

    for (const workflow of DEFAULT_WORKFLOWS) {
      const { data: existing } = await supabaseAdmin
        .from("ai_workflows")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("action_type", workflow.action_type)
        .eq("name", workflow.name)
        .maybeSingle()

      if (!existing) {
        await supabaseAdmin.from("ai_workflows").insert({
          workspace_id: workspaceId,
          ...workflow,
        })
      }
    }

    const { data, error } = await supabaseAdmin
      .from("ai_workflows")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true })

    if (error) throw new Error(error.message)

    return NextResponse.json({ workflows: data || [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load workflows" },
      { status: 500 }
    )
  }
}
