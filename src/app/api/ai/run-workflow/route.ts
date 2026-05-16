import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { runAI } from "@/lib/ai/provider"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function buildWorkflowPrompt(workflow: any, contact: any) {
  const companyName = contact?.crm_companies?.name || "Unknown company"

  return `
Workflow: ${workflow.name}
Action type: ${workflow.action_type}
Prompt template: ${workflow.prompt_template || "No template provided"}

Contact:
- First name: ${contact?.first_name || "Unknown"}
- Last name: ${contact?.last_name || "Unknown"}
- Title: ${contact?.title || "Unknown"}
- Email: ${contact?.email || "Unknown"}
- Company: ${companyName}
- Lead score: ${contact?.score ?? "Unknown"}
- Status: ${contact?.status || "Unknown"}

Return a concise, structured sales intelligence output.
`
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

    const aiResult = await runAI({
      prompt: buildWorkflowPrompt(workflow, contact),
    })

    const output = {
      provider: aiResult.provider,
      model: aiResult.model,
      content: aiResult.content,
      usage: aiResult.usage,
    }

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
