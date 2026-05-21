"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const WORKSPACE_ID = "43eff06d-a85a-427e-a4ed-7423bfa7fc6e"

type AgentInsight = {
  agent: string
  priority: "critical" | "high" | "medium" | "low"
  title: string
  insight: string
  action: string
}

type AgentResponse = {
  success: boolean
  summary: {
    totalLeads: number
    salesReady: number
    hot: number
    warm: number
    cold: number
    sent: number
    pending: number
    failed: number
    averageScore: number
  }
  insights: AgentInsight[]
}

type Lead = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  title: string | null
  lead_score: number | null
  hot_lead: boolean | null
  lifecycle_stage: string | null
  crm_companies?: {
    name?: string | null
    industry?: string | null
    domain?: string | null
  } | null
}

type LeadResponse = {
  success: boolean
  summary: {
    total: number
    hot: number
    salesReady: number
    warm: number
    cold: number
  }
  leads: Lead[]
}

type Recommendation = {
  priority: "critical" | "high" | "medium" | "low"
  category: string
  title: string
  detail: string
  action: string
}

type RecommendationResponse = {
  success: boolean
  recommendations: Recommendation[]
}

type CopilotAction = {
  type: string
  priority: "critical" | "high" | "medium" | "low"
  title: string
  reasoning: string
  suggestedMessage?: string
  email?: string
}

type CopilotResponse = {
  success: boolean
  actions: CopilotAction[]
}

export default function RevenueCommandPage() {
  const [agentData, setAgentData] = useState<AgentResponse | null>(null)
  const [leadData, setLeadData] = useState<LeadResponse | null>(null)
  const [recommendationData, setRecommendationData] =
    useState<RecommendationResponse | null>(null)
  const [copilotData, setCopilotData] = useState<CopilotResponse | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadCommandCenter() {
    setLoading(true)

    const [agentRes, leadRes, recommendationRes, copilotRes] =
      await Promise.all([
        fetch(`/api/agents/revenue-system?workspaceId=${WORKSPACE_ID}`, {
          cache: "no-store",
        }),
        fetch(`/api/intelligence/leads?workspaceId=${WORKSPACE_ID}`, {
          cache: "no-store",
        }),
        fetch(`/api/intelligence/recommendations?workspaceId=${WORKSPACE_ID}`, {
          cache: "no-store",
        }),
        fetch(`/api/intelligence/copilot?workspaceId=${WORKSPACE_ID}`, {
          cache: "no-store",
        }),
      ])

    const [agentJson, leadJson, recommendationJson, copilotJson] =
      await Promise.all([
        agentRes.json(),
        leadRes.json(),
        recommendationRes.json(),
        copilotRes.json(),
      ])

    setAgentData(agentJson)
    setLeadData(leadJson)
    setRecommendationData(recommendationJson)
    setCopilotData(copilotJson)
    setLoading(false)
  }

  useEffect(() => {
    loadCommandCenter()
  }, [])

  const revenueHealthScore = useMemo(() => {
    if (!agentData?.summary) return 0

    const { hot, warm, failed, pending, averageScore } = agentData.summary

    const base = 50
    const engagementBonus = hot * 15 + warm * 5
    const scoreBonus = Math.min(averageScore, 30)
    const riskPenalty = failed * 20 + pending * 2

    return Math.max(
      0,
      Math.min(100, base + engagementBonus + scoreBonus - riskPenalty)
    )
  }, [agentData])

  const leadChartData = useMemo(() => {
    if (!agentData?.summary) return []

    return [
      { name: "Hot", value: agentData.summary.hot },
      { name: "Warm", value: agentData.summary.warm },
      { name: "Cold", value: agentData.summary.cold },
      { name: "Sales Ready", value: agentData.summary.salesReady },
    ]
  }, [agentData])

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <p className="text-slate-300">Loading revenue command center...</p>
      </main>
    )
  }

  if (!agentData?.success) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <p className="text-red-300">Unable to load revenue command data.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
            ProspectIQ Revenue OS
          </p>
          <h1 className="mt-2 text-4xl font-semibold">
            Executive Revenue Command Center
          </h1>
          <p className="mt-3 max-w-4xl text-slate-300">
            Unified AI agent intelligence, lead scoring, outbound execution,
            revenue health, and autonomous next-action recommendations.
          </p>
        </div>

        <button
          onClick={loadCommandCenter}
          className="rounded-xl border border-cyan-400/40 px-5 py-3 text-sm font-medium text-cyan-200 hover:bg-cyan-400/10"
        >
          Refresh Command Center
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-4 xl:grid-cols-8">
        <MetricCard label="Revenue Health" value={`${revenueHealthScore}%`} />
        <MetricCard label="Total Leads" value={agentData.summary.totalLeads} />
        <MetricCard label="Hot" value={agentData.summary.hot} />
        <MetricCard label="Warm" value={agentData.summary.warm} />
        <MetricCard label="Cold" value={agentData.summary.cold} />
        <MetricCard label="Sent" value={agentData.summary.sent} />
        <MetricCard label="Pending" value={agentData.summary.pending} />
        <MetricCard label="Failed" value={agentData.summary.failed} />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.05] p-6 shadow-2xl xl:col-span-2">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
            Multi-Agent Intelligence Feed
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Revenue Agents Are Monitoring This Workspace
          </h2>
          <p className="mt-2 text-slate-300">
            SDR, pipeline risk, engagement optimization, sequence optimization,
            and executive intelligence agents are generating coordinated
            recommendations.
          </p>

          <div className="mt-6 grid gap-4">
            {agentData.insights.map((insight, index) => (
              <AgentInsightCard
                key={`${insight.agent}-${index}`}
                insight={insight}
              />
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
          <h2 className="text-lg font-semibold">Lead Mix</h2>
          <p className="mt-1 text-sm text-slate-400">
            Current lifecycle distribution from revenue intelligence.
          </p>

          <div className="mt-6 h-72 min-h-[288px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <Panel title="Executive Recommendations" subtitle="Strategic actions generated from lead and queue intelligence.">
          <div className="space-y-4">
            {(recommendationData?.recommendations || []).map((rec, index) => (
              <ActionCard
                key={`${rec.title}-${index}`}
                badge={rec.priority}
                title={rec.title}
                body={rec.detail}
                footer={rec.action}
              />
            ))}
          </div>
        </Panel>

        <Panel title="AI Copilot Actions" subtitle="Practical next moves generated for sales execution.">
          <div className="space-y-4">
            {(copilotData?.actions || []).map((action, index) => (
              <ActionCard
                key={`${action.title}-${index}`}
                badge={action.priority}
                title={action.title}
                body={action.reasoning}
                footer={action.suggestedMessage || action.email || "Review action"}
              />
            ))}
          </div>
        </Panel>
      </section>

      <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
        <h2 className="text-lg font-semibold">Hot Lead Escalation</h2>
        <p className="mt-1 text-sm text-slate-400">
          Highest-priority contacts for manual or AI-assisted follow-up.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-white/10 text-slate-400">
              <tr>
                <th className="py-3 pr-4">Lead</th>
                <th className="py-3 pr-4">Company</th>
                <th className="py-3 pr-4">Title</th>
                <th className="py-3 pr-4">Stage</th>
                <th className="py-3 pr-4">Score</th>
                <th className="py-3 pr-4">Recommended Handling</th>
              </tr>
            </thead>
            <tbody>
              {(leadData?.leads || [])
                .filter((lead) => lead.hot_lead || lead.lifecycle_stage === "hot")
                .map((lead) => (
                  <tr key={lead.id} className="border-b border-white/5">
                    <td className="py-4 pr-4">
                      <div className="font-medium">
                        {[lead.first_name, lead.last_name]
                          .filter(Boolean)
                          .join(" ") || "Unnamed Lead"}
                      </div>
                      <div className="text-slate-400">{lead.email}</div>
                    </td>
                    <td className="py-4 pr-4">
                      <div>{lead.crm_companies?.name || "Unknown"}</div>
                      <div className="text-slate-400">
                        {lead.crm_companies?.industry || "No industry"}
                      </div>
                    </td>
                    <td className="py-4 pr-4">{lead.title || "—"}</td>
                    <td className="py-4 pr-4 capitalize">
                      {lead.lifecycle_stage || "cold"}
                    </td>
                    <td className="py-4 pr-4 font-semibold">
                      {lead.lead_score || 0}
                    </td>
                    <td className="py-4 pr-4 text-cyan-300">
                      Generate AI follow-up or assign sales owner
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

function MetricCard({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  )
}

function AgentInsightCard({ insight }: { insight: AgentInsight }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-cyan-300">{insight.agent}</span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase text-slate-300">
              {insight.priority}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-semibold">{insight.title}</h3>
          <p className="mt-2 text-sm text-slate-400">{insight.insight}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200 md:max-w-sm">
          {insight.action}
        </div>
      </div>
    </div>
  )
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  )
}

function ActionCard({
  badge,
  title,
  body,
  footer,
}: {
  badge: string
  title: string
  body: string
  footer: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
      <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase text-violet-200">
        {badge}
      </span>
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{body}</p>
      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200">
        {footer}
      </div>
    </div>
  )
}
