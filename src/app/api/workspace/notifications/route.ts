import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const workspaceId = searchParams.get("workspaceId")

  if (!workspaceId) {
    return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 })
  }

  const result = await supabase
    .from("workspace_notifications")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(100)

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 })
  }

  return NextResponse.json({ notifications: result.data || [] })
}

export async function PATCH(req: NextRequest) {
  try {
    const { notificationId, read = true } = await req.json()

    if (!notificationId) {
      return NextResponse.json({ error: "Missing notificationId" }, { status: 400 })
    }

    const result = await supabase
      .from("workspace_notifications")
      .update({
        read,
        read_at: read ? new Date().toISOString() : null,
      })
      .eq("id", notificationId)
      .select("*")
      .single()

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ notification: result.data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update notification" },
      { status: 500 }
    )
  }
}
