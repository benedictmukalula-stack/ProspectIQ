"use client"

import { useMemo, useState } from "react"

const leads = [
  {
    name: "Thabo Mokoena",
    title: "Head of Operations",
    company: "AfriBridge Logistics",
    email: "thabo@example.com",
    source: "LinkedIn Research",
    score: 87,
    status: "Qualified",
    intent: "High",
    nextAction: "Send logistics visibility outreach",
  },
  {
    name: "Sarah Naidoo",
    title: "Sales Director",
    company: "Cape Trade Group",
    email: "sarah@example.com",
    source: "CRM Import",
    score: 74,
    status: "Contacted",
    intent: "Medium",
    nextAction: "Follow up with sales automation case study",
  },
  {
    name: "Michael Dlamini",
    title: "Managing Director",
    company: "Dlamini Industrial Supply",
    email: "michael@example.com",
    source: "Manual Research",
    score: 91,
    status: "Hot",
    intent: "High",
    nextAction: "Book discovery call",
  },
]

export default function LeadsPage() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesQuery = [lead.name, lead.company, lead.title, lead.email]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())

      const matchesStatus = status === "all" || lead.status === status

      return matchesQuery && matchesStatus
    })
  }, [query, status])

  const averageScore = Math.round(
    filteredLeads.reduce((sum, lead) => sum + lead.score, 0) / Math.max(filteredLeads.length, 1)
  )

  return (
    <main className="space-y-8">
      <section className="rounded-2xl border bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
        <p className="text-sm text-slate-300">Lead Intelligence</p>
        <h1 className="mt-2 text-3xl font-bold">Premium Leads Workspace</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Prioritize prospects using fit score, intent signals, source quality, and AI-recommended next actions.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["Visible Leads", filteredLeads.length],
            ["Average Score", averageScore],
            ["High Intent", filteredLeads.filter((lead) => lead.intent === "High").length],
            ["Hot Leads", filteredLeads.filter((lead) => lead.status === "Hot").length],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-300">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap gap-3 rounded-xl border p-4">
        <input
          className="min-w-[260px] flex-1 rounded-lg border px-3 py-2 text-sm"
          placeholder="Search leads, companies, titles, emails..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <select className="rounded-lg border px-3 py-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="Qualified">Qualified</option>
          <option value="Contacted">Contacted</option>
          <option value="Hot">Hot</option>
        </select>

        <a href="/dashboard/linkedin" className="rounded-lg bg-black px-4 py-2 text-sm text-white">
          Research New Leads
        </a>
      </section>

      <section className="grid gap-4">
        {filteredLeads.map((lead) => (
          <article key={lead.email} className="rounded-xl border p-6">
            <div className="grid gap-5 md:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border px-2 py-0.5 text-xs">{lead.status}</span>
                  <span className="rounded-full border px-2 py-0.5 text-xs">{lead.intent} intent</span>
                  <span className="rounded-full border px-2 py-0.5 text-xs">{lead.source}</span>
                </div>

                <h2 className="mt-3 text-xl font-semibold">{lead.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {lead.title} · {lead.company}
                </p>
                <p className="mt-2 text-sm">{lead.email}</p>

                <div className="mt-4 rounded-lg bg-muted p-4 text-sm">
                  <strong>AI next action:</strong> {lead.nextAction}
                </div>
              </div>

              <div className="rounded-xl border p-5 text-center">
                <p className="text-sm text-muted-foreground">Fit Score</p>
                <p className="mt-2 text-4xl font-semibold">{lead.score}</p>
                <p className="mt-1 text-xs text-muted-foreground">/ 100</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">View Profile</button>
              <button className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Add to Sequence</button>
              <button className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Create Task</button>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
