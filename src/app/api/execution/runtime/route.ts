import { NextRequest, NextResponse } from "next/server"
import { generateAutonomousOptimizations } from "../lib/optimization/autonomous-optimizer"
import { executeAutonomousCorrections } from "../lib/execution/runtime-correction"

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

    const predictionResponse = await fetch(
      `${baseUrl}/api/prediction/workspace`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId,
        }),
      }
    )

    const predictionData = await predictionResponse.json()

    if (!predictionResponse.ok) {
      return NextResponse.json(
        {
          error:
            predictionData.error || "Prediction engine unavailable",
        },
        { status: 500 }
      )
    }

    const optimization = generateAutonomousOptimizations({
      intelligence: predictionData.intelligence,
      prediction: predictionData.prediction,
    })

    const execution = await executeAutonomousCorrections({
      baseUrl,
      workspaceId,
      actions: optimization.actions,
    })

    return NextResponse.json({
      optimization,
      execution,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.message || "Autonomous execution runtime failed",
      },
      { status: 500 }
    )
  }
}
