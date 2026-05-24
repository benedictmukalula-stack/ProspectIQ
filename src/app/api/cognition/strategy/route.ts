import { NextRequest, NextResponse } from "next/server"
import { generateStrategicInitiatives } from "../lib/planning/strategic-planner"
import { buildStrategicPlanSummary } from "../lib/cognition/cognitive-runtime"

export async function POST(req: NextRequest) {
  try {
    const { workspaceId } = await req.json()

    if (!workspaceId) {
      return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 })
    }

    const baseUrl = req.nextUrl.origin

    const [predictionResponse, semanticResponse, intelligenceResponse] =
      await Promise.all([
        fetch(`${baseUrl}/api/prediction/workspace`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceId }),
          cache: "no-store",
        }),
        fetch(`${baseUrl}/api/semantic/workspace?workspaceId=${workspaceId}`, {
          cache: "no-store",
        }),
        fetch(`${baseUrl}/api/dashboard/intelligence`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceId }),
          cache: "no-store",
        }),
      ])

    const predictionData = await predictionResponse.json()
    const semanticData = await semanticResponse.json()
    const intelligenceData = await intelligenceResponse.json()

    if (!predictionResponse.ok) {
      return NextResponse.json(
        { error: predictionData.error || "Prediction layer unavailable" },
        { status: 500 }
      )
    }

    const initiatives = generateStrategicInitiatives({
      prediction: predictionData.prediction,
      semanticGraph: semanticData.semanticGraph,
      intelligence: intelligenceData.intelligence,
    })

    return NextResponse.json({
      initiatives,
      summary: buildStrategicPlanSummary(initiatives),
      context: {
        prediction: predictionData.prediction,
        semanticHealth: semanticData.semanticGraph?.semanticHealth || 0,
        workspaceSummary: intelligenceData.intelligence?.summary || {},
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Cognitive strategy runtime failed" },
      { status: 500 }
    )
  }
}
