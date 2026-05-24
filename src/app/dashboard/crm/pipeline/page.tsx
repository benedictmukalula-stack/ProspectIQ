"use client"

import { useMemo, useState } from "react"

const stages = ["New", "Qualified", "Contacted", "Proposal", "Negotiation", "Won", "Lost"]

const initialDeals = [
  {
    id: "deal-1",
    company: "AfriBridge Logistics",
    contact: "Thabo Mokoena",
    title: "Operations Director",
    stage: "Qualified",
    value: 18000,
    probability: 65,
    source: "LinkedIn Research",
    nextAction: "Send personalized logistics visibility email",
    lastActivity: "Opened outbound email",
    age: 2,
  },
  {
    id: "deal-2",
    company: "SALA Investments",
    contact: "Benedict Mukalula",
    title: "Director",
    stage: "Proposal",
    value: 42000,
    probability: 75,
    source: "CRM",
    nextAction: "Prepare automation and website growth proposal",
    lastActivity: "AI workflow completed",
    age: 5,
  },
  {
    id: "deal-3",
    company: "Reliable Mobility Solutions",
    contact: "Crispus Jere",
    title: "Founder",
    stage: "Contacted",
    value: 12000,
    probability: 45,
    source: "Referral",
    nextAction: "Book discovery call",
    lastActivity: "Follow-up task created",
    age: 4,
  },
  {
    id: "deal-4",
    company: "Knowledge Camp Global",
    contact: "Training Manager",
    title: "Corporate Training Lead",
    stage: "Negotiation",
    value: 55000,
    probability: 82,
    source: "Inbound",
    nextAction: "Confirm enterprise training automation scope",
    lastActivity: "Proposal viewed",
    age: 8,
  },
]

export default function PipelinePage() {
  const [deals, setDeals] = useState(initialDeals)
  const [selectedDeal, setSelectedDeal] = useState<any>(initialDeals[0])
  const [message, setMessage] = useState("Advanced CRM pipeline loaded in demo mode.")

  function moveDeal(dealId: string, direction: "back" | "forward") {
    setDeals((current) =>
      current.map((deal) => {
        if (deal.id !== dealId) return deal

        const index = stages.indexOf(deal.stage)
        const nextIndex = direction === "forward" ? Math.min(index + 1, stages.length - 1) : Math.max(index - 1, 0)

        return {
          ...deal,
          stage: stages[nextIndex],
          probability: direction === "forward" ? Math.min(deal.probability + 10, 100) : Math.max(deal.probability - 10, 5),
        }
      })
    )

    setMessage("Pipeline stage updated locally. Supabase persistence can be connected next.")
  }

  const summary = useMemo(() => {
    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0)
    const weightedValue = deals.reduce((sum, deal) => sum + deal.value * (deal.probability / 100), 0)
    const wonValue = deals.filter((deal) => deal.stage === "Won").reduce((sum, deal) => sum + deal.value, 0)
    const activeDeals = deals.filter((deal) => !["Won", "Lost"].includes(deal.stage)).length

    return { totalValue, weightedValue, wonValue, activeDeals }
  }, [deals])

  return (
    <main className="space-y-8">
      <section className="rounded-2xl border bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
        <p className="text-sm text-slate-300">CRM Pipeline</p>
        <h1 className="mt-2 text-3xl font-bold">Advanced Sales Pipeline</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Manage opportunities, forecast revenue, track stage movement, and identify AI-recommended next actions.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["Pipeline Value", `$${summary.recipienttalValue.toLocaleString()}`],
            ["Weighted Forecast", `$${Math.round(summary.weightedValue).toLocaleString()}`],
            ["Won Revenue", `$${summary.wonValue.toLocaleString()}`],
            ["Active Deals", summary.activeDeals],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-300">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {message && <div className="rounded-xl border p-4 text-sm">{message}</div>}

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="overflow-x-auto rounded-xl border p-4">
          <div className="grid min-w-[1100px] grid-cols-7 gap-4">
            {stages.map((stage) => {
              const stageDeals = deals.filter((deal) => deal.stage === stage)
              const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0)

              return (
                <div key={stage} className="space-y-3">
                  <div className="rounded-lg bg-muted p-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold">{stage}</h2>
                      <span className="rounded-full border bg-background px-2 py-0.5 text-xs">{stageDeals.length}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">${stageValue.toLocaleString()}</p>
                  </div>

                  {stageDeals.map((deal) => (
                    <button
                      key={deal.id}
                      onClick={() => setSelectedDeal(deal)}
                      className="w-full rounded-xl border p-4 text-left transition hover:bg-muted"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">{deal.company}</h3>
                          <p className="text-xs text-muted-foreground">{deal.contact}</p>
                        </div>
                        <span className="rounded-full border px-2 py-0.5 text-xs">{deal.probability}%</span>
                      </div>

                      <p className="mt-3 text-sm font-medium">${deal.value.toLocaleString()}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{deal.nextAction}</p>

                      <div className="mt-4 flex gap-2">
                        <span
                          onClick={(event) => {
                            event.stopPropagation()
                            moveDeal(deal.id, "back")
                          }}
                          className="rounded-lg border px-2 py-1 text-xs hover:bg-background"
                        >
                          Back
                        </span>
                        <span
                          onClick={(event) => {
                            event.stopPropagation()
                            moveDeal(deal.id, "forward")
                          }}
                          className="rounded-lg bg-black px-2 py-1 text-xs text-white"
                        >
                          Move
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border p-6">
            <h2 className="text-lg font-semibold">Deal Intelligence</h2>

            {selectedDeal ? (
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Company</p>
                  <p className="font-medium">{selectedDeal.company}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Contact</p>
                  <p className="font-medium">
                    {selectedDeal.contact} · {selectedDeal.title}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Stage</p>
                  <p className="font-medium">{selectedDeal.stage}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Forecast</p>
                  <p className="font-medium">
                    ${Math.round(selectedDeal.value * (selectedDeal.probability / 100)).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">AI Recommended Next Action</p>
                  <p className="font-medium">{selectedDeal.nextAction}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Activity</p>
                  <p className="font-medium">{selectedDeal.lastActivity}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Select a deal to view details.</p>
            )}
          </div>

          <div className="rounded-xl border p-6">
            <h2 className="text-lg font-semibold">Pipeline Controls</h2>
            <div className="mt-4 space-y-3">
              <button className="w-full rounded-lg border px-4 py-2 text-sm hover:bg-muted">Create Opportunity</button>
              <button className="w-full rounded-lg border px-4 py-2 text-sm hover:bg-muted">Export Pipeline</button>
              <button className="w-full rounded-lg border px-4 py-2 text-sm hover:bg-muted">Run AI Forecast</button>
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}
