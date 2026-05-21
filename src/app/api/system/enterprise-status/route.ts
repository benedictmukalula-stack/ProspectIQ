import { NextResponse } from "next/server"

const MODULES = [
  ["Revenue Command", "/dashboard/revenue-command", "/api/agents/revenue-system"],
  ["Executive Governance", "/dashboard/governance", "/api/governance/executive"],
  ["Boardroom Briefing", "/dashboard/executive", "/api/boardroom/executive-briefing"],
  ["Revenue Forecast", "/dashboard/predictions", "/api/enterprise/revenue-forecast"],
  ["Executive Simulation", "/dashboard/simulation", "/api/simulation/executive"],
  ["Runtime Enforcement", "/dashboard/execution", "/api/runtime/enforcement"],
  ["Autonomous Executor", "/dashboard/execution", "/api/executor/autonomous-runtime"],
  ["Commercial Usage", "/dashboard/usage", "/api/commercial/usage"],
  ["Platform Mesh", "/dashboard/benchmarks", "/api/global-intelligence/mesh"],
  ["Self Improvement", "/dashboard/strategy", "/api/self-improvement/global"],
  ["Strategic Decisions", "/dashboard/strategy", "/api/strategy/autonomous"],
  ["AI Council", "/dashboard/council", "/api/council/executive"],
]

export async function GET() {
  return NextResponse.json({
    success: true,
    status: "operational",
    modules: MODULES.map(([name, dashboardPath, apiPath]) => ({
      name,
      dashboardPath,
      apiPath,
      status: "registered",
    })),
    summary: {
      registeredModules: MODULES.length,
      enterpriseLayer: true,
      autonomousGovernance: true,
      commercialMetering: true,
      executiveBoardroom: true,
      runtimeExecution: true,
    },
  })
}
