import { InfrastructureRisk, summarizeInfrastructureRisks, } from "../lib/resilience/resilience-engine";
export function analyzeInfrastructureHealth({ intelligence, runtime, approvals, snapshots, }) {
    const risks = [];
    if (intelligence?.health?.security === "review_needed") {
        risks.push({
            id: "security_review_needed",
            title: "Security hardening remains incomplete",
            severity: "critical",
            category: "security",
            impact: "Production readiness is blocked until RLS, service keys, and webhook validation are reviewed.",
            recommendation: "Complete Supabase RLS policies, rotate secrets, and verify server-only service role usage.",
            selfHealingAvailable: false,
            scoreImpact: 25,
        });
    }
    if (intelligence?.health?.emailProvider === "mock_mode") {
        risks.push({
            id: "mock_email_provider",
            title: "Email infrastructure is still in mock mode",
            severity: "high",
            category: "configuration",
            impact: "Outbound workflows cannot operate in real production delivery mode.",
            recommendation: "Connect Resend, SendGrid, Postmark, or Amazon SES and verify webhook handling.",
            selfHealingAvailable: false,
            scoreImpact: 18,
        });
    }
    if ((runtime?.failedAgents || 0) > 0) {
        risks.push({
            id: "agent_runtime_failures",
            title: "Agent runtime failures detected",
            severity: "high",
            category: "runtime",
            impact: "Autonomous monitoring reliability may be degraded.",
            recommendation: "Inspect failed agent output and stabilize failing runtime endpoints.",
            selfHealingAvailable: true,
            scoreImpact: 16,
        });
    }
    if (!snapshots?.length) {
        risks.push({
            id: "runtime_memory_missing",
            title: "Runtime memory has no recent snapshots",
            severity: "medium",
            category: "runtime",
            impact: "Adaptive trend learning and historical intelligence are limited.",
            recommendation: "Trigger the agent runtime or verify cron scheduling is active.",
            selfHealingAvailable: true,
            scoreImpact: 10,
        });
    }
    const pendingApprovals = approvals?.filter?.((item) => item.status === "pending").length || 0;
    if (pendingApprovals > 5) {
        risks.push({
            id: "approval_queue_backlog",
            title: "Governance approval backlog is growing",
            severity: "medium",
            category: "runtime",
            impact: "Autonomous execution may slow down due to unresolved approvals.",
            recommendation: "Review pending approvals and reject or approve queued actions.",
            selfHealingAvailable: false,
            scoreImpact: 8,
        });
    }
    return {
        risks,
        summary: summarizeInfrastructureRisks(risks),
    };
}
