import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { runAutonomousRevenueAgent } from "@/lib/ai/autonomous-revenue-agent"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { workspaceId, contactId } = await req.json()

    if (!workspaceId || !contactId) {
      return NextResponse.json(
        { success: false, error: "Missing workspaceId or contactId" },
        { status: 400 }
      )
    }

    const result = await runAutonomousRevenueAgent({
      workspaceId,
      contactId,
      supabase: supabaseAdmin,
    })

    return NextResponse.json({
      success: result.success,
      result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Autonomous agent failed",
      },
      { status: 500 }
    )
  }
}
