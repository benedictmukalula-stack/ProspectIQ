import { NextRequest, NextResponse } from "next/server"
import { predictRevenueSignals } from "../lib/prediction/revenue-forecast"

export async function POST(req: NextRequest) {
  try {
    const { workspaceId } = await req.json()

    if (!workspaceId) {
      return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 })
    }

    const baseUrl = req.nextUrl.origin

    const [intelligenceResponse, graphResponse] = await Promise.all([
      fetch(`${baseUrl}/api/dashboard/intelligence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
        cache: "no-store",
      }),
      fetch(`${baseUrl}/api/graph/workspace?workspaceId=${workspaceId}`, {
        cache: "no-store",
      }),
    ])

    const intelligenceData = await intelligenceResponse.json()
    const graphData = await graphResponse.json()

    if (!intelligenceResponse.ok) {
      return NextResponse.json(
        { error: intelligenceData.error || "Failed to load intelligence" },
        { status: 500 }
      )
    }

    const prediction = predictRevenueSignals({
      intelligence: intelligenceData.intelligence,
      graph: graphData.graph,
    })

    return NextResponse.json({
      prediction,
      intelligence: intelligenceData.intelligence,
      graphSummary: graphData.graph?.summary || null,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Prediction engine failed" },
      { status: 500 }
    )
  }
}
