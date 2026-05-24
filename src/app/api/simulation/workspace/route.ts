import { NextRequest, NextResponse } from "next/server"
import { generateSimulationScenarios } from "../lib/scenarios/scenario-engine"
import { buildSimulationSummary } from "../lib/simulation/simulation-runtime"

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
      predictionResponse,
      riskResponse,
      strategyResponse,
    ] = await Promise.all([
      fetch(
        `${baseUrl}/api/prediction/workspace`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            workspaceId,
          }),
        }
      ),

      fetch(
        `${baseUrl}/api/risk/workspace`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            workspaceId,
          }),
        }
      ),

      fetch(
        `${baseUrl}/api/cognition/strategy`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            workspaceId,
          }),
        }
      ),
    ])

    const prediction =
      await predictionResponse.json()

    const risks =
      await riskResponse.json()

    const strategy =
      await strategyResponse.json()

    const scenarios =
      generateSimulationScenarios({
        prediction:
          prediction.prediction,
        risks,
        strategy,
      })

    return NextResponse.json({
      scenarios,
      summary:
        buildSimulationSummary(
          scenarios
        ),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.message ||
          "Simulation runtime failed",
      },
      { status: 500 }
    )
  }
}
