import {
  evaluateExecutionPolicy,
  ExecutionDecision,
  ExecutionPolicyInput,
} from "@/lib/policies/execution-policy"

export type DecisionEvaluation = ExecutionPolicyInput & {
  decision: ExecutionDecision
}

export function evaluateAutonomousDecisions(actions: ExecutionPolicyInput[]): DecisionEvaluation[] {
  return actions.map((action) => ({
    ...action,
    decision: evaluateExecutionPolicy(action),
  }))
}

export function summarizeDecisionEvaluations(evaluations: DecisionEvaluation[]) {
  return {
    total: evaluations.length,
    autoExecute: evaluations.filter((item) => item.decision.outcome === "auto_execute").length,
    requiresApproval: evaluations.filter((item) => item.decision.outcome === "requires_approval").length,
    blocked: evaluations.filter((item) => item.decision.outcome === "blocked").length,
    critical: evaluations.filter((item) => item.decision.risk === "critical").length,
    highRisk: evaluations.filter((item) => item.decision.risk === "high").length,
  }
}
