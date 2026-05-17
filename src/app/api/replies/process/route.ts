import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { classifyReply } from "@/lib/ai/reply-intelligence"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const {
      workspaceId,
      queueId,
      contactId,
      subject,
      body,
    } = await req.json()

    if (!workspaceId || !body) {
      return NextResponse.json(
        { error: "Missing workspaceId or body" },
        { status: 400 }
      )
    }

    const intelligence = classifyReply(body)

    const { data: reply, error } = await supabaseAdmin
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

    if (error) throw new Error(error.message)

    if (
      intelligence.classification === "interested" &&
      contactId
    ) {
      await supabaseAdmin.from("tasks").insert({
        workspace_id: workspaceId,
        contact_id: contactId,
        title: "Follow up with interested prospect",
        status: "open",
        priority: "high",
      })

      await supabaseAdmin
        .from("inbound_replies")
        .update({
          created_task: true,
        })
        .eq("id", reply.id)
    }

    await supabaseAdmin.from("activity_timeline").insert({
      workspace_id: workspaceId,
      contact_id: contactId || null,
      activity_type: "reply_processed",
      title: `Reply classified: ${intelligence.classification}`,
      description: intelligence.summary,
      metadata: {
        reply_id: reply.id,
        classification: intelligence.classification,
        sentiment: intelligence.sentiment,
        confidence: intelligence.confidence,
      },
    })

    return NextResponse.json({
      reply,
      intelligence,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Reply processing failed",
      },
      { status: 500 }
    )
  }
}
