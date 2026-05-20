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

const WORKSPACE_ID = "43eff06d-a85a-427e-a4ed-7423bfa7fc6e"

export default function LeadIntelligencePage() {
  const [data, setData] = useState<LeadResponse | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadLeads() {
    setLoading(true)

    const res = await fetch(`/api/intelligence/leads?workspaceId=${WORKSPACE_ID}`, {
      cache: "no-store",
    })

    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  useEffect(() => {
    loadLeads()
  }, [])

  const lifecycleData = useMemo(() => {
    if (!data?.summary) return []

    return [
      { name: "Sales Ready", value: data.summary.salesReady },
      { name: "Hot", value: data.summary.hot },
      { name: "Warm", value: data.summary.warm },
      { name: "Cold", value: data.summary.cold },
    ]
  }, [data])

  const scoreData = useMemo(() => {
    return (
      data?.leads?.map((lead) => ({
        name:
          [lead.first_name, lead.last_name].filter(Boolean).join(" ") ||
          lead.email ||
          "Lead",
        score: lead.lead_score || 0,
      })) || []
    )
  }, [data])

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <p className="text-slate-300">Loading lead intelligence...</p>
      </main>
    )
  }

  if (!data?.success) {
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
            Executive Lead Intelligence
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Ranked lead intelligence from engagement scoring, lifecycle stage,
            company context, and outbound activity.
          </p>
        </div>

        <button
          onClick={loadLeads}
          className="rounded-xl border border-cyan-400/40 px-5 py-3 text-sm font-medium text-cyan-200 hover:bg-cyan-400/10"
        >
          Refresh Intelligence
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-5">
        <MetricCard label="Total Leads" value={data.summary.total} />
        <MetricCard label="Sales Ready" value={data.summary.salesReady} />
        <MetricCard label="Hot Leads" value={data.summary.hot} />
        <MetricCard label="Warm Leads" value={data.summary.warm} />
        <MetricCard label="Cold Leads" value={data.summary.cold} />
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
          CRM contacts enriched with company context and engagement intelligence.
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
              {data.leads.map((lead) => (
                <tr key={lead.id} className="border-b border-white/5">
                  <td className="py-4 pr-4">
                    <div className="font-medium">
                      {[lead.first_name, lead.last_name].filter(Boolean).join(" ") ||
                        "Unnamed Lead"}
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
