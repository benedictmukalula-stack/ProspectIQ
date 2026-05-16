import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { userId, email } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    let { data: workspace, error } = await supabaseAdmin
      .from("workspaces")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) throw new Error(error.message)

    if (!workspace) {
      const { data: created, error: createError } = await supabaseAdmin
        .from("workspaces")
        .insert({
          name: email ? `${email}'s Workspace` : "ProspectIQ Workspace",
          owner_id: userId,
          plan: "free",
        })
        .select("*")
        .single()

      if (createError) throw new Error(createError.message)
      workspace = created

      await supabaseAdmin.from("workspace_members").insert({
        workspace_id: workspace.id,
        user_id: userId,
        role: "owner",
      })
    }

    return NextResponse.json({ workspace })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load workspace" },
      { status: 500 }
    )
  }
}
