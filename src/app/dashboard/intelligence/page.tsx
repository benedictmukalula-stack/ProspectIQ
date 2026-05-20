"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

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
    domain?: string | null
    industry?: string | null
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
  summary: {
    totalContacts: number
    salesReady: number
    hot: number
    warm: number
    cold: number
    sent: number
    pending: number
    failed: number
  }
  recommendations: Recommendation[]
}

const WORKSPACE_ID = "43eff06d-a85a-427e-a4ed-7423bfa7fc6e"

export default function LeadIntelligencePage() {
  const [leadData, setLeadData] = useState<LeadResponse | null>(null)
  const [recommendationData, setRecommendationData] =
    useState<RecommendationResponse | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadIntelligence() {
    setLoading(true)

    const [leadRes, recommendationRes] = await Promise.all([
      fetch(`/api/intelligence/leads?workspaceId=${WORKSPACE_ID}`, {
        cache: "no-store",
      }),
      fetch(`/api/intelligence/recommendations?workspaceId=${WORKSPACE_ID}`, {
        cache: "no-store",
      }),
    ])

    const [leadJson, recommendationJson] = await Promise.all([
      leadRes.json(),
      recommendationRes.json(),
    ])

    setLeadData(leadJson)
    setRecommendationData(recommendationJson)
    setLoading(false)
  }

  useEffect(() => {
    loadIntelligence()
  }, [])

  const lifecycleData = useMemo(() => {
    if (!leadData?.summary) return []

    return [
      { name: "Sales Ready", value: leadData.summary.salesReady },
      { name: "Hot", value: leadData.summary.hot },
      { name: "Warm", value: leadData.summary.warm },
      { name: "Cold", value: leadData.summary.cold },
    ]
  }, [leadData])

  const scoreData = useMemo(() => {
    return (
      leadData?.leads?.map((lead) => ({
        name:
          [lead.first_name, lead.last_name].filter(Boolean).join(" ") ||
          lead.email ||
          "Lead",
        score: lead.lead_score || 0,
      })) || []
    )
  }, [leadData])

  const topRecommendation = recommendationData?.recommendations?.[0]

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <p className="text-slate-300">Loading executive intelligence...</p>
      </main>
    )
  }

  if (!leadData?.success) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <p className="text-red-300">Unable to load lead intelligence.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            ProspectIQ Intelligence
          </p>
          <h1 className="mt-2 text-4xl font-semibold">
            Executive Lead Command Center
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Engagement scoring, ranked leads, lifecycle intelligence, and
            executive recommendations for revenue action.
          </p>
        </div>

        <button
          onClick={loadIntelligence}
          className="rounded-xl border border-cyan-400/40 px-5 py-3 text-sm font-medium text-cyan-200 hover:bg-cyan-400/10"
        >
          Refresh Intelligence
        </button>
      </div>

      {topRecommendation && (
        <section className="mb-8 rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.06] p-6 shadow-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                Top Executive Recommendation
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {topRecommendation.title}
              </h2>
              <p className="mt-2 max-w-3xl text-slate-300">
                {topRecommendation.detail}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 lg:max-w-md">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Recommended Action
              </p>
              <p className="mt-2 text-sm text-white">
                {topRecommendation.action}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Total Leads" value={leadData.summary.total} />
        <MetricCard label="Sales Ready" value={leadData.summary.salesReady} />
        <MetricCard label="Hot Leads" value={leadData.summary.hot} />
        <MetricCard label="Warm Leads" value={leadData.summary.warm} />
        <MetricCard label="Cold Leads" value={leadData.summary.cold} />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl xl:col-span-2">
          <h2 className="text-lg font-semibold">Executive Recommendations</h2>
          <p className="mt-1 text-sm text-slate-400">
            Actionable intelligence generated from lead scores, lifecycle
            stages, and outbound queue health.
          </p>

          <div className="mt-6 grid gap-4">
            {(recommendationData?.recommendations || []).map((rec, index) => (
              <RecommendationCard key={`${rec.title}-${index}`} rec={rec} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
          <h2 className="text-lg font-semibold">Pipeline Health</h2>
          <p className="mt-1 text-sm text-slate-400">
            Snapshot of lead and outbound execution quality.
          </p>

          <div className="mt-6 space-y-4">
            <HealthRow
              label="Sent Messages"
              value={recommendationData?.summary?.sent || 0}
            />
            <HealthRow
              label="Pending Queue"
              value={recommendationData?.summary?.pending || 0}
            />
            <HealthRow
              label="Failed Messages"
              value={recommendationData?.summary?.failed || 0}
            />
            <HealthRow
              label="Hot + Sales Ready"
              value={
                (recommendationData?.summary?.hot || 0) +
                (recommendationData?.summary?.salesReady || 0)
              }
            />
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
          <h2 className="text-lg font-semibold">Lead Score Ranking</h2>
          <p className="mt-1 text-sm text-slate-400">
            Highest engagement-scored leads ranked first.
          </p>

          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
          <h2 className="text-lg font-semibold">Lifecycle Distribution</h2>
          <p className="mt-1 text-sm text-slate-400">
            Lead temperature breakdown across the workspace.
          </p>

          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={lifecycleData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {lifecycleData.map((_, index) => (
                    <Cell key={index} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
        <h2 className="text-lg font-semibold">Ranked Lead Table</h2>
        <p className="mt-1 text-sm text-slate-400">
          CRM contacts enriched with company context and engagement
          intelligence.
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
                <th className="py-3 pr-4">Signal</th>
              </tr>
            </thead>
            <tbody>
              {leadData.leads.map((lead) => (
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
                  <td className="py-4 pr-4">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs capitalize">
                      {lead.lifecycle_stage || "cold"}
                    </span>
                  </td>
                  <td className="py-4 pr-4 font-semibold">
                    {lead.lead_score || 0}
                  </td>
                  <td className="py-4 pr-4">
                    {lead.hot_lead ? (
                      <span className="text-cyan-300">Priority follow-up</span>
                    ) : (
                      <span className="text-slate-400">Monitor</span>
                    )}
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

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  )
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase text-slate-300">
              {rec.priority}
            </span>
            <span className="text-sm text-cyan-300">{rec.category}</span>
          </div>

          <h3 className="mt-3 text-lg font-semibold">{rec.title}</h3>
          <p className="mt-2 text-sm text-slate-400">{rec.detail}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200 md:max-w-xs">
          {rec.action}
        </div>
      </div>
    </div>
  )
}

function HealthRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  )
}
