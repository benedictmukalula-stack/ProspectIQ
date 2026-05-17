import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendEmail } from "@/lib/email/provider"

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

    const { data: queueItems, error } = await supabaseAdmin
      .from("outbound_send_queue")
      .select(`
        *,
        crm_contacts(email, first_name, last_name),
        outbound_enrollments(current_step)
      `)
      .eq("workspace_id", workspaceId)
      .eq("status", "queued")
      .lte("scheduled_for", new Date().toISOString())
      .order("created_at", { ascending: true })
      .limit(20)

    if (error) throw new Error(error.message)

    const sent: string[] = []

    for (const item of queueItems || []) {
      const hasEmail = Boolean(item.crm_contacts?.email)

      if (!hasEmail) {
        await supabaseAdmin
          .from("outbound_send_queue")
          .update({
            status: "failed",
            error: "Missing recipient email",
          })
          .eq("id", item.id)

        continue
      }

      const delivery = await sendEmail({
        to: item.crm_contacts.email,
        subject: item.subject || "ProspectIQ outreach",
        body: item.body,
      })

      await supabaseAdmin
        .from("outbound_send_queue")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          metadata: {
            ...(item.metadata || {}),
            provider: delivery.provider,
            provider_message_id: delivery.messageId,
            simulated_delivery: delivery.simulated,
          },
        })
        .eq("id", item.id)

      await supabaseAdmin.from("outbound_events").insert({
        workspace_id: workspaceId,
        queue_id: item.id,
        contact_id: item.contact_id,
        event_type: "sent",
        provider: delivery.provider,
        provider_message_id: delivery.messageId,
        metadata: delivery,
      })

      sent.push(item.id)

      await supabaseAdmin.from("activity_timeline").insert({
        workspace_id: workspaceId,
        contact_id: item.contact_id,
        activity_type: delivery.simulated ? "email_sent_simulated" : "email_sent",
        title: delivery.simulated ? "Outbound email simulated" : "Outbound email sent",
        description: `${delivery.simulated ? "Simulated email" : "Email"} sent to ${item.crm_contacts.email}.`,
        metadata: {
          queue_id: item.id,
          subject: item.subject,
          provider: delivery.provider,
          provider_message_id: delivery.messageId,
          simulated: delivery.simulated,
        },
      })

      const nextStep = Number(item.outbound_enrollments?.current_step || 1) + 1

      await supabaseAdmin
        .from("outbound_enrollments")
        .update({
          current_step: nextStep,
          next_send_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.enrollment_id)
    }

    return NextResponse.json({ sent })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Send processing failed" },
      { status: 500 }
    )
  }
}
