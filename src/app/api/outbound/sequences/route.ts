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

    const { data: existing } = await supabaseAdmin
      .from("outbound_sequences")
      .select("*, outbound_sequence_steps(*)")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true })

    if (existing && existing.length > 0) {
      return NextResponse.json({ sequences: existing })
    }

    const { data: sequence, error: sequenceError } = await supabaseAdmin
      .from("outbound_sequences")
      .insert({
        workspace_id: workspaceId,
        name: "Standard ProspectIQ Outreach",
        description: "Three-step AI-assisted outbound sequence.",
        status: "active",
      })
      .select("*")
      .single()

    if (sequenceError) throw new Error(sequenceError.message)

    const { error: stepsError } = await supabaseAdmin
      .from("outbound_sequence_steps")
      .insert([
        {
          sequence_id: sequence.id,
          step_order: 1,
          delay_days: 0,
          subject: "Improving your prospecting workflow",
          body: "Hi there,\n\nI wanted to introduce ProspectIQ, an AI sales intelligence platform that helps teams automate lead research, scoring, and outbound workflow preparation.\n\nWould it be worth a short conversation?",
        },
        {
          sequence_id: sequence.id,
          step_order: 2,
          delay_days: 3,
          subject: "Following up on ProspectIQ",
          body: "Hi there,\n\nJust following up. ProspectIQ helps sales teams centralize prospect intelligence, automate research, and prepare personalized outbound campaigns.\n\nWould you be open to reviewing whether it fits your process?",
        },
        {
          sequence_id: sequence.id,
          step_order: 3,
          delay_days: 7,
          subject: "Final check-in",
          body: "Hi there,\n\nI do not want to crowd your inbox. If improving lead intelligence, prospecting workflows, or outbound consistency is relevant, I would be happy to share a quick overview.\n\nBest regards,\nProspectIQ Team",
        },
      ])

    if (stepsError) throw new Error(stepsError.message)

    const { data: sequences, error } = await supabaseAdmin
      .from("outbound_sequences")
      .select("*, outbound_sequence_steps(*)")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true })

    if (error) throw new Error(error.message)

    return NextResponse.json({ sequences: sequences || [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load sequences" },
      { status: 500 }
    )
  }
}
