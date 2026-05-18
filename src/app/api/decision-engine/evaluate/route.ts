import { NextRequest, NextResponse } from "next/server"
import {
  evaluateAutonomousDecisions,
  summarizeDecisionEvaluations,
} from "@/lib/decision-engine/decision-engine"

export async function POST(req: NextRequest) {
  try {
    const { actions = [] } = await req.json()

    if (!Array.isArray(actions)) {
      return NextResponse.json({ error: "actions must be an array" }, { status: 400 })
    }

    const evaluations = evaluateAutonomousDecisions(actions)
    const summary = summarizeDecisionEvaluations(evaluations)

    return NextResponse.json({
      evaluations,
      summary,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Decision evaluation failed" },
      { status: 500 }
    )
  }
}
