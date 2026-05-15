const stages = [
  {
    name: "New Lead",
    deals: [
      { company: "ExportHub", contact: "Daniel P.", value: "$18K", priority: "Medium" },
      { company: "TradeGate", contact: "Amara L.", value: "$12K", priority: "Low" },
    ],
  },
  {
    name: "Contacted",
    deals: [
      { company: "TradeLink Africa", contact: "James K.", value: "$32K", priority: "High" },
    ],
  },
  {
    name: "Qualified",
    deals: [
      { company: "Atlas Freight", contact: "Sarah M.", value: "$48K", priority: "High" },
    ],
  },
  {
    name: "Proposal",
    deals: [
      { company: "CargoPrime", contact: "Lerato N.", value: "$76K", priority: "High" },
    ],
  },
  {
    name: "Won",
    deals: [
      { company: "PortLink Logistics", contact: "Michael T.", value: "$24K", priority: "Closed" },
    ],
  },
];

export default function PipelinePage() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ CRM</p>
        <h1 className="mt-2 text-3xl font-bold">Pipeline</h1>
        <p className="mt-2 text-slate-400">
          Phase 4C sales pipeline using mock data only. No drag-and-drop yet.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-5">
        {stages.map((stage) => (
          <section
            key={stage.name}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">{stage.name}</h2>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                {stage.deals.length}
              </span>
            </div>

            <div className="space-y-4">
              {stage.deals.map((deal) => (
                <div
                  key={`${deal.company}-${deal.contact}`}
                  className="rounded-xl border border-white/10 bg-slate-900/80 p-4"
                >
                  <h3 className="font-semibold">{deal.company}</h3>
                  <p className="mt-1 text-sm text-slate-400">{deal.contact}</p>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-emerald-300">{deal.value}</span>
                    <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-300">
                      {deal.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
