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

    const { data, error } = await supabaseAdmin
      .from("outbound_send_queue")
      .select(`
        *,
        crm_contacts(email, first_name, last_name, title),
        outbound_sequences(name),
        outbound_sequence_steps(step_order, delay_days)
      `)
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) throw new Error(error.message)

    return NextResponse.json({ queue: data || [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load send queue" },
      { status: 500 }
    )
  }
}
