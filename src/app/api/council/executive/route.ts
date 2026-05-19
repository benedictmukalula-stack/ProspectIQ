import { NextRequest, NextResponse } from "next/server"
import { generateExecutiveCouncil } from "@/lib/council/executive-council"
import { calculateCouncilConsensus } from "@/lib/coordination/consensus-engine"

export async function POST(req: NextRequest) {
  try {
    const { workspaceId } = await req.json()

    if (!workspaceId) {
      return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 })
    }

    const baseUrl = req.nextUrl.origin

    const [predictionResponse, strategyResponse, governanceResponse, semanticResponse] =
      await Promise.all([
        fetch(`${baseUrl}/api/prediction/workspace`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceId }),
          cache: "no-store",
        }),
        fetch(`${baseUrl}/api/cognition/strategy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspaceId }),
          cache: "no-store",
        }),
        fetch(`${baseUrl}/api/governance/approvals?workspaceId=${workspaceId}`, {
          cache: "no-store",
        }),
        fetch(`${baseUrl}/api/semantic/workspace?workspaceId=${workspaceId}`, {
          cache: "no-store",
        }),
      ])

    const [prediction, strategy, governance, semantic] = await Promise.all([
      predictionResponse.json(),
      strategyResponse.json(),
      governanceResponse.json(),
      semanticResponse.json(),
    ])

    const opinions = generateExecutiveCouncil({
      prediction: prediction.prediction,
      strategy,
      governance,
      semantic,
    })

    const consensus = calculateCouncilConsensus(opinions)

    return NextResponse.json({
      opinions,
      consensus,
      context: {
        forecastLabel: prediction.prediction?.forecastLabel,
        strategicReadiness: strategy.summary?.strategicReadiness,
        semanticHealth: semantic.semanticGraph?.semanticHealth,
        pendingApprovals:
          governance.approvals?.filter?.((item: any) => item.status === "pending").length || 0,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Executive council failed" },
      { status: 500 }
    )
  }
}
