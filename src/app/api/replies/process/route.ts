import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { classifyReply } from "../lib/ai/reply-intelligence"
import { generateFollowUpDraft } from "../lib/replies/follow-up"
import { calculateLeadScore } from "../lib/crm/score-contact"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { workspaceId, queueId, contactId, subject, body } = await req.json()

    if (!workspaceId || !body) {
      return NextResponse.json({ error: "Missing workspaceId or body" }, { status: 400 })
    }

    const intelligence = classifyReply(body)

    const { data: reply, error: replyError } = await supabaseAdmin
      .from("inbound_replies")
      .insert({
        workspace_id: workspaceId,
        queue_id: queueId || null,
        contact_id: contactId || null,
        subject: subject || null,
        body,
        classification: intelligence.classification,
        sentiment: intelligence.sentiment,
        confidence: intelligence.confidence,
        ai_summary: intelligence.summary,
        suggested_action: intelligence.suggestedAction,
      })
      .select("*")
      .single()

    if (replyError) throw new Error(`Reply insert failed: ${replyError.message}`)

    let task: { id?: string } | null = null
    let followUpDraft: { id?: string } | null = null

    if (intelligence.classification === "interested") {
      const result = await supabaseAdmin
        .from("tasks")
        .insert({
          workspace_id: workspaceId,
          contact_id: contactId || null,
          title: "Follow up with interested prospect",
          description: intelligence.summary,
          status: "open",
          priority: "high",
          source: "reply_intelligence",
          metadata: {
            reply_id: reply.id,
            classification: intelligence.classification,
            sentiment: intelligence.sentiment,
            confidence: intelligence.confidence,
          },
        })
        .select("*")
        .single()

      if (result.error) {
        throw new Error(`Task creation failed: ${result.error.message}`)
      }

      task = result.data

      await supabaseAdmin
        .from("inbound_replies")
        .update({ created_task: true })
        .eq("id", reply.id)
    }

    const scoring = calculateLeadScore(
      intelligence.classification
    )

    let updatedContact = null

    if (contactId) {
      const { data: contact } = await supabaseAdmin
        .from("crm_contacts")
        .select("*")
        .eq("id", contactId)
        .single()

      if (contact) {
        const nextScore =
          (contact.lead_score || 0) + scoring.scoreDelta

        const { data: updated } = await supabaseAdmin
          .from("crm_contacts")
          .update({
            lead_score: nextScore,
            lifecycle_stage: scoring.lifecycleStage,
            hot_lead: scoring.hotLead,
          })
          .eq("id", contactId)
          .select("*")
          .single()

        updatedContact = updated

        await supabaseAdmin.from("activity_timeline").insert({
          workspace_id: workspaceId,
          contact_id: contactId,
          activity_type: "lead_score_updated",
          title: "Lead score updated",
          description:
            `Lead score changed by ${scoring.scoreDelta} and stage moved to ${scoring.lifecycleStage}.`,
          metadata: {
            classification: intelligence.classification,
            score_delta: scoring.scoreDelta,
            lifecycle_stage: scoring.lifecycleStage,
            hot_lead: scoring.hotLead,
          },
        })
      }
    }

    const draft = generateFollowUpDraft({
      classification: intelligence.classification,
      body,
    })

    if (draft) {
      const { data: createdDraft, error: draftError } = await supabaseAdmin
        .from("outbound_drafts")
        .insert({
          workspace_id: workspaceId,
          contact_id: contactId || null,
          queue_id: queueId || null,
          channel: "email",
          subject: draft.subject,
          body: draft.body,
          status: "draft",
          metadata: {
            source: "reply_intelligence",
            reply_id: reply.id,
            classification: intelligence.classification,
            original_reply: body,
          },
        })
        .select("*")
        .single()

      if (draftError) {
        throw new Error(`Follow-up draft creation failed: ${draftError.message}`)
      }

      followUpDraft = createdDraft

      await supabaseAdmin.from("activity_timeline").insert({
        workspace_id: workspaceId,
        contact_id: contactId || null,
        activity_type: "follow_up_draft_created",
        title: "AI follow-up draft created",
        description: `ProspectIQ created a follow-up draft for ${intelligence.classification}.`,
        metadata: {
          reply_id: reply.id,
          draft_id: createdDraft.id,
          classification: intelligence.classification,
        },
      })
    }

    await supabaseAdmin.from("activity_timeline").insert({
      workspace_id: workspaceId,
      contact_id: contactId || null,
      activity_type: "reply_processed",
      title: `Reply classified: ${intelligence.classification}`,
      description: intelligence.summary,
      metadata: {
        reply_id: reply.id,
        task_id: task?.id || null,
        task_created: Boolean(task?.id),
        classification: intelligence.classification,
      },
    })

    return NextResponse.json({
      reply,
      intelligence,
      taskCreated: Boolean(task?.id),
      task,
      followUpDraftCreated: Boolean(followUpDraft?.id),
      followUpDraft,
      updatedContact,
      scoring,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Reply processing failed" },
      { status: 500 }
    )
  }
}
