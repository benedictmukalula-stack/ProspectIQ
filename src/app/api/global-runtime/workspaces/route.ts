import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { summarizeWorkspaceRegistry } from "../lib/tenancy/workspace-registry"

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  const result = await supabase
    .from("workspaces")
    .select("id,name,plan,owner_id,created_at")
    .order("created_at", { ascending: false })

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 })
  }

  const workspaces = result.data || []

  return NextResponse.json({
    workspaces,
    summary: summarizeWorkspaceRegistry(workspaces),
  })
}
