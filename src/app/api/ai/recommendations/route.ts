import { NextRequest, NextResponse } from "next/server"
import { generateExecutiveSummary, generateWorkspaceRecommendations } from "@/lib/ai/recommendation-engine"

export async function POST(req: NextRequest) {
  try {
    const { workspaceId } = await req.json()

    if (!workspaceId) {
      return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 })
    }

    const baseUrl = req.nextUrl.origin

    const intelligenceResponse = await fetch(`${baseUrl}/api/dashboard/intelligence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId }),
      cache: "no-store",
    })

    const intelligenceData = await intelligenceResponse.json()

    if (!intelligenceResponse.ok) {
      return NextResponse.json(
        { error: intelligenceData.error || "Failed to load workspace intelligence" },
        { status: 500 }
      )
    }

    const intelligence = intelligenceData.intelligence
    const recommendations = generateWorkspaceRecommendations(intelligence)
    const executiveSummary = generateExecutiveSummary(intelligence)

    return NextResponse.json({
      executiveSummary,
      recommendations,
      intelligence,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate AI recommendations" },
      { status: 500 }
    )
  }
}
