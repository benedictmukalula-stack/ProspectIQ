import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { runMultiTenantRuntime } from "../lib/global-runtime/multi-tenant-orchestrator"

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req: NextRequest) {
  try {
    const { createEvents = true, limit = 25 } = await req.json().catch(() => ({}))

    const result = await supabase
      .from("workspaces")
      .select("id,name,plan,owner_id,created_at")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    const runtime = await runMultiTenantRuntime({
      baseUrl: req.nextUrl.origin,
      workspaces: result.data || [],
      createEvents,
    })

    return NextResponse.json(runtime)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Global runtime failed" },
      { status: 500 }
    )
  }
}
