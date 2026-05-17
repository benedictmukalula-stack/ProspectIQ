import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { workspaceId } = await req.json()

    if (!workspaceId) {
      return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 })
    }

    const { data: events, error } = await supabaseAdmin
      .from("automation_events")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(10)

    if (error) throw new Error(error.message)

    const processed: string[] = []

    for (const event of events || []) {
      if (event.event_type === "contact_created" && event.entity_id) {
        const { data: workflows } = await supabaseAdmin
          .from("ai_workflows")
          .select("*")
          .eq("workspace_id", workspaceId)
          .in("action_type", ["lead_score", "email_draft"])

        for (const workflow of workflows || []) {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/run-workflow`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              workflowId: workflow.id,
              contactId: event.entity_id,
            }),
          })
        }

        await supabaseAdmin.from("activity_timeline").insert({
          workspace_id: workspaceId,
          contact_id: event.entity_id,
          activity_type: "automation_processed",
          title: "Contact automation processed",
          description:
            "ProspectIQ scored the lead and generated outbound workflow assets.",
          metadata: { event },
        })
      }

      await supabaseAdmin
        .from("automation_events")
        .update({
          status: "processed",
          processed_at: new Date().toISOString(),
        })
        .eq("id", event.id)

      processed.push(String(event.id))
    }

    return NextResponse.json({ processed })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Processing failed" },
      { status: 500 }
    )
  }
}
