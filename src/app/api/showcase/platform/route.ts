import { NextResponse } from "next/server"
import {
  calculatePlatformMaturity,
  buildCapabilityMap,
} from "../lib/showcase/platform-maturity"

export async function GET() {
  const modules = [
    "AI Assistant",
    "Executive Dashboard",
    "Observability",
    "Governance",
    "Benchmarks",
    "Command Graph",
    "Semantic Intelligence",
    "Strategy",
    "AI Council",
    "Risk Center",
    "Infrastructure",
    "Simulation",
    "Predictions",
    "Execution",
  ]

  const maturity = calculatePlatformMaturity({
    modules,
    intelligence: true,
    governance: true,
    simulation: true,
  })

  return NextResponse.json({
    maturity,
    modules,
    capabilityMap: buildCapabilityMap(),
    positioning: {
      category:
        "Autonomous Enterprise Intelligence Infrastructure",
      marketPosition:
        "Enterprise Cognitive Operating System",
      differentiation: [
        "Multi-agent AI governance",
        "Semantic operational intelligence",
        "Autonomous simulation runtime",
        "Infrastructure resilience reasoning",
        "Executive strategic coordination",
      ],
    },
  })
}
