import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateMockAIOutput(actionType: string, contact: any) {
  switch (actionType) {
    case "lead_score":
      return {
        score: 87,
        reasoning:
          "Strong operational role, enterprise company profile, and high CRM automation fit.",
        recommendation:
          "Prioritize for outbound discovery sequence.",
      }

    case "email_draft":
      return {
        subject: `Improving sales intelligence workflows at ${contact?.company || "your company"}`,
        body:
          `Hi ${contact?.first_name || "there"},\n\n` +
          `I noticed your role in operations and thought ProspectIQ could help streamline prospect research, enrichment, and outbound workflows.\n\n` +
          `Would you be open to a short introduction call?\n\nRegards,\nProspectIQ`,
      }

    default:
      return {
        message: "Workflow executed successfully.",
      }
  }
}

export async function POST(req: Request) {
  try {
    const { workflowId, contactId } = await req.json()

    if (!workflowId) {
      return NextResponse.json(
        { error: "Missing workflowId" },
        { status: 400 }
      )
    }

    const { data: workflow, error: workflowError } = await supabaseAdmin
      .from("ai_workflows")
      .select("*")
      .eq("id", workflowId)
      .single()

    if (workflowError || !workflow) {
      throw new Error(workflowError?.message || "Workflow not found")
    }

    let contact: any = null

    if (contactId) {
      const { data: contactData } = await supabaseAdmin
        .from("crm_contacts")
        .select("*, crm_companies(name)")
        .eq("id", contactId)
        .maybeSingle()

      contact = contactData
    }

    const { data: run, error: runError } = await supabaseAdmin
      .from("ai_workflow_runs")
      .insert({
        workflow_id: workflow.id,
        workspace_id: workflow.workspace_id,
        contact_id: contact?.id || null,
        company_id: contact?.company_id || null,
        status: "running",
        input: {
          workflow: workflow.name,
          contact,
        },
      })
      .select("*")
      .single()

    if (runError || !run) {
      throw new Error(runError?.message || "Failed to create workflow run")
    }

    const output = generateMockAIOutput(workflow.action_type, {
      first_name: contact?.first_name,
      company: contact?.crm_companies?.name,
    })

    const { data: updatedRun, error: updateError } = await supabaseAdmin
      .from("ai_workflow_runs")
      .update({
        status: "completed",
        output,
        completed_at: new Date().toISOString(),
      })
      .eq("id", run.id)
      .select("*")
      .single()

    if (updateError) {
      throw new Error(updateError.message)
    }

    return NextResponse.json({
      success: true,
      run: updatedRun,
      output,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Workflow execution failed",
      },
      { status: 500 }
    )
  }
}
