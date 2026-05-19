export function calculatePlatformMaturity({
  modules,
  intelligence,
  governance,
  simulation,
}: any) {
  const activeModules = modules.length

  const maturity =
    Math.min(
      100,
      35 +
        activeModules * 2 +
        (simulation ? 12 : 0) +
        (governance ? 10 : 0) +
        (intelligence ? 15 : 0)
    )

  let category = "Emerging"

  if (maturity >= 90) {
    category = "Enterprise Cognitive Infrastructure"
  } else if (maturity >= 80) {
    category = "Autonomous Enterprise Platform"
  } else if (maturity >= 65) {
    category = "Advanced AI Operations Platform"
  }

  return {
    maturity,
    category,
  }
}

export function buildCapabilityMap() {
  return [
    {
      layer: "Executive Intelligence",
      modules: [
        "Executive Dashboard",
        "AI Council",
        "Strategic Planning",
      ],
    },

    {
      layer: "Autonomous Operations",
      modules: [
        "Revenue Execution",
        "Workflow Engine",
        "Runtime Orchestration",
      ],
    },

    {
      layer: "Semantic Intelligence",
      modules: [
        "Knowledge Graph",
        "Relationship Intelligence",
        "Semantic Ranking",
      ],
    },

    {
      layer: "Governance & Risk",
      modules: [
        "Governance Center",
        "Risk Center",
        "Infrastructure Intelligence",
      ],
    },

    {
      layer: "Predictive Intelligence",
      modules: [
        "Revenue Forecasting",
        "Simulation Runtime",
        "Benchmark Intelligence",
      ],
    },
  ]
}
