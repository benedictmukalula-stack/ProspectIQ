"use client"

import { useMemo, useState } from "react"

const companies = [
  {
    name: "AfriBridge Logistics",
    industry: "Logistics & Trade",
    employees: "50-200",
    revenue: "$4.2M",
    fit: 92,
    relationship: "Active Opportunity",
    tech: ["HubSpot", "Slack", "Microsoft 365"],
    intent: "High",
    contacts: 4,
    nextAction: "Prepare enterprise logistics automation proposal",
  },
  {
    name: "Knowledge Camp Global",
    industry: "Corporate Training",
    employees: "10-50",
    revenue: "$1.1M",
    fit: 88,
    relationship: "Proposal Stage",
    tech: ["Google Workspace", "Zoom"],
    intent: "High",
    contacts: 3,
    nextAction: "Finalize enterprise LMS workflow scope",
  },
  {
    name: "Reliable Mobility Solutions",
    industry: "Automotive",
    employees: "1-10",
    revenue: "$600K",
    fit: 76,
    relationship: "Early Engagement",
    tech: ["WhatsApp Business"],
    intent: "Medium",
    contacts: 2,
    nextAction: "Expand sourcing and export operations discussion",
  },
]

export default function CompaniesPage() {
  const [query, setQuery] = useState("")
  const [intentFilter, setIntentFilter] = useState("all")

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesQuery = [company.name, company.industry]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())

      const matchesIntent =
        intentFilter === "all" || company.intent === intentFilter

      return matchesQuery && matchesIntent
    })
  }, [query, intentFilter])

  const totalPipeline = filteredCompanies.reduce((sum, company) => {
    return sum + Number(company.revenue.replace(/[$M,K]/g, ""))
  }, 0)

  return (
    <main className="space-y-8">
      <section className="rounded-2xl border bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
        <p className="text-sm text-slate-300">Account Intelligence</p>

        <h1 className="mt-2 text-3xl font-bold">
          Companies Intelligence Workspace
        </h1>

        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Monitor account fit, buyer intent, technology stack, opportunity
          maturity, and expansion potential across your target organizations.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["Tracked Accounts", filteredCompanies.length],
            [
              "High Intent Accounts",
              filteredCompanies.filter((c) => c.intent === "High").length,
            ],
            [
              "Avg Account Fit",
              Math.round(
                filteredCompanies.reduce((sum, c) => sum + c.fit, 0) /
                  Math.max(filteredCompanies.length, 1)
              ),
            ],
            ["Pipeline Potential", `$${totalPipeline.recipientFixed(1)}M`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <p className="text-xs text-slate-300">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap gap-3 rounded-xl border p-4">
        <input
          className="min-w-[260px] flex-1 rounded-lg border px-3 py-2 text-sm"
          placeholder="Search companies or industries..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <select
          className="rounded-lg border px-3 py-2 text-sm"
          value={intentFilter}
          onChange={(event) => setIntentFilter(event.target.value)}
        >
          <option value="all">All intent levels</option>
          <option value="High">High intent</option>
          <option value="Medium">Medium intent</option>
        </select>

        <button className="rounded-lg bg-black px-4 py-2 text-sm text-white">
          Add Account
        </button>
      </section>

      <section className="grid gap-5">
        {filteredCompanies.map((company) => (
          <article key={company.name} className="rounded-xl border p-6">
            <div className="grid gap-6 xl:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border px-2 py-0.5 text-xs">
                    {company.relationship}
                  </span>

                  <span className="rounded-full border px-2 py-0.5 text-xs">
                    {company.intent} intent
                  </span>

                  <span className="rounded-full border px-2 py-0.5 text-xs">
                    {company.industry}
                  </span>
                </div>

                <h2 className="mt-3 text-2xl font-semibold">
                  {company.name}
                </h2>

                <div className="mt-4 grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Employees</p>
                    <p className="mt-1 text-sm font-medium">
                      {company.employees}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="mt-1 text-sm font-medium">
                      {company.revenue}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Buying Contacts
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {company.contacts}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Account Fit
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {company.fit}/100
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs text-muted-foreground">
                    Detected Technology Stack
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {company.tech.map((tool) => (
                      <span
                        key={tool}
                        className="rounded-full bg-muted px-3 py-1 text-xs"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-muted p-4 text-sm">
                  <strong>AI account strategy:</strong> {company.nextAction}
                </div>
              </div>

              <div className="rounded-xl border p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Account Health
                </p>

                <p className="mt-2 text-5xl font-semibold">
                  {company.fit}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  / 100 fit score
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                View Account
              </button>

              <button className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                View Contacts
              </button>

              <button className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                Add to Campaign
              </button>

              <button className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                Run AI Research
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
