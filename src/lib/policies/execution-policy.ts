export type DecisionRisk = "low" | "medium" | "high" | "critical"
export type DecisionOutcome = "auto_execute" | "requires_approval" | "blocked"

export type ExecutionPolicyInput = {
  title: string
  category?: string
  priority?: string
  source?: string
  actionType?: string
  confidence?: number
}

export type ExecutionDecision = {
  outcome: DecisionOutcome
  risk: DecisionRisk
  confidence: number
  reason: string
  requiredApprovalRole?: "admin" | "owner"
}

export function evaluateExecutionPolicy(input: ExecutionPolicyInput): ExecutionDecision {
  const confidence = Math.max(0, Math.min(100, input.confidence ?? 70))
  const priority = input.priority || "medium"
  const category = input.category || "operations"
  const actionType = input.actionType || "recommendation"

  if (category === "security") {
    return {
      outcome: "requires_approval",
      risk: "critical",
      confidence,
      reason: "Security-related operations require explicit owner approval.",
      requiredApprovalRole: "owner",
    }
  }

  if (category === "billing") {
    return {
      outcome: "requires_approval",
      risk: "critical",
      confidence,
      reason: "Billing operations require owner approval.",
      requiredApprovalRole: "owner",
    }
  }

  if (actionType.includes("send") || actionType.includes("email")) {
    return {
      outcome: confidence >= 85 ? "requires_approval" : "blocked",
      risk: "high",
      confidence,
      reason: "Outbound sending cannot auto-execute until production safeguards are enabled.",
      requiredApprovalRole: "admin",
    }
  }

  if (priority === "high") {
    return {
      outcome: "requires_approval",
      risk: "high",
      confidence,
      reason: "High-priority operational actions require admin review.",
      requiredApprovalRole: "admin",
    }
  }

  if (confidence < 50) {
    return {
      outcome: "blocked",
      risk: "medium",
      confidence,
      reason: "Confidence below execution threshold.",
    }
  }

  if (confidence >= 75 && priority === "low") {
    return {
      outcome: "auto_execute",
      risk: "low",
      confidence,
      reason: "Low-risk, high-confidence action approved for autonomous execution.",
    }
  }

  return {
    outcome: "requires_approval",
    risk: "medium",
    confidence,
    reason: "Action requires human approval based on current policy.",
    requiredApprovalRole: "admin",
  }
}
