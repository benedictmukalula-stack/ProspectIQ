import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { QUEUE_STATUS } from "@/lib/queue/status";

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

    const { data: enrollments, error: enrollmentError } = await supabaseAdmin
      .from("outbound_enrollments")
      .select(`
        *,
        crm_contacts(email, first_name, last_name),
        outbound_sequences(name)
      `)
      .eq("workspace_id", workspaceId)
      .eq("status", "active")
      .lte("next_send_at", new Date().toISOString())

    if (enrollmentError) throw new Error(enrollmentError.message)

    const queued: string[] = []

    for (const enrollment of enrollments || []) {
      const { data: step, error: stepError } = await supabaseAdmin
        .from("outbound_sequence_steps")
        .select("*")
        .eq("sequence_id", enrollment.sequence_id)
        .eq("step_order", enrollment.current_step)
        .maybeSingle()

      if (stepError) throw new Error(stepError.message)
      if (!step) continue

      const { data: existing } = await supabaseAdmin
        .from("outbound_send_queue")
        .select("id")
        .eq("enrollment_id", enrollment.id)
        .eq("step_id", step.id)
        .maybeSingle()

      if (existing) continue

      const contactName =
        [enrollment.crm_contacts?.first_name, enrollment.crm_contacts?.last_name]
          .filter(Boolean)
          .join(" ") || "there"

      const body = String(step.body || "").replaceAll("Hi there", `Hi ${contactName}`)

      const { data: queuedItem, error: queueError } = await supabaseAdmin
        .from("outbound_send_queue")
        .insert({
          workspace_id: workspaceId,
          enrollment_id: enrollment.id,
          sequence_id: enrollment.sequence_id,
          step_id: step.id,
          contact_id: enrollment.contact_id,
          channel: step.channel || "email",
          subject: step.subject,
          body,
          status: QUEUE_STATUS.PENDING,
          scheduled_for: new Date().toISOString(),
          metadata: {
            sequence_name: enrollment.outbound_sequences?.name,
            contact_email: enrollment.crm_contacts?.email,
            step_order: step.step_order,
          },
        })
        .select("*")
        .single()

      if (queueError) throw new Error(queueError.message)

      queued.push(String(queuedItem.id))

      await supabaseAdmin.from("activity_timeline").insert({
        workspace_id: workspaceId,
        contact_id: enrollment.contact_id,
        activity_type: "send_queued",
        title: "Outbound message queued",
        description: `Step ${step.step_order} was queued for simulated delivery.`,
        metadata: {
          queue_id: queuedItem.id,
          sequence_id: enrollment.sequence_id,
          step_id: step.id,
        },
      })
    }

    return NextResponse.json({ queued })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Queue build failed" },
      { status: 500 }
    )
  }
}