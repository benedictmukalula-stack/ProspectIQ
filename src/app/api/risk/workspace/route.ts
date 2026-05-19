import { NextRequest, NextResponse } from "next/server"
import { generateRiskAssessment } from "@/lib/risk/risk-engine"

export async function POST(req: NextRequest) {
  try {
    const { workspaceId } = await req.json()

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      )
    }

    const baseUrl = req.nextUrl.origin

    const [
      intelligenceResponse,
      predictionResponse,
      governanceResponse,
      runtimeResponse,
    ] = await Promise.all([
      fetch(`${baseUrl}/api/dashboard/intelligence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workspaceId }),
      }),

      fetch(`${baseUrl}/api/prediction/workspace`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workspaceId }),
      }),

      fetch(
        `${baseUrl}/api/governance/approvals?workspaceId=${workspaceId}`
      ),

      fetch(`${baseUrl}/api/agents/runtime`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId,
          createEvents: false,
        }),
      }),
    ])

    const intelligence =
      await intelligenceResponse.json()

    const prediction =
      await predictionResponse.json()

    const governance =
      await governanceResponse.json()

    const runtime =
      await runtimeResponse.json()

    const assessment = generateRiskAssessment({
      intelligence: intelligence.intelligence,
      prediction: prediction.prediction,
      governance,
      runtime,
    })

    return NextResponse.json(assessment)
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.message ||
          "Risk assessment failed",
      },
      { status: 500 }
    )
  }
}
