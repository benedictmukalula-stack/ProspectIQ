import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const workspaceId = searchParams.get("workspaceId")

    if (!workspaceId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing workspaceId",
        },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from("crm_contacts")
      .select(`
        id,
        first_name,
        last_name,
        email,
        title,
        lead_score,
        hot_lead,
        lifecycle_stage,
        company_id,
        crm_companies(name,domain,industry)
      `)
      .eq("workspace_id", workspaceId)
      .order("lead_score", { ascending: false })
      .limit(100)

    if (error) {
      throw new Error(error.message)
    }

    const summary = {
      total: data?.length || 0,
      hot:
        data?.filter((c) => c.lifecycle_stage === "hot").length || 0,
      salesReady:
        data?.filter((c) => c.lifecycle_stage === "sales-ready").length || 0,
      warm:
        data?.filter((c) => c.lifecycle_stage === "warm").length || 0,
      cold:
        data?.filter((c) => c.lifecycle_stage === "cold").length || 0,
    }

    return NextResponse.json({
      success: true,
      summary,
      leads: data || [],
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Lead intelligence failed",
      },
      { status: 500 }
    )
  }
}
