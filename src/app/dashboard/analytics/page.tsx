const metrics = [
  ["Lead Conversion Rate", "18.4%", "+3.2%"],
  ["Reply Rate", "11.2%", "+1.4%"],
  ["Open Rate", "42.8%", "+5.1%"],
  ["Meetings Booked", "14", "+4"],
]

const charts = [
  {
    title: "Pipeline Velocity",
    description: "Track how quickly opportunities move across stages.",
  },
  {
    title: "Sequence Performance",
    description: "Monitor opens, replies, and conversions per sequence.",
  },
  {
    title: "Lead Source Quality",
    description: "Compare conversion performance across acquisition sources.",
  },
  {
    title: "AI Workflow Activity",
    description: "Review AI-assisted scoring, drafting, enrichment, and automation usage.",
  },
]

export default function AnalyticsPage() {
  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Real-time intelligence across leads, outbound performance, CRM progression, and AI activity.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value, delta]) => (
          <div key={label} className="rounded-xl border p-6">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
            <p className="mt-1 text-xs text-emerald-500">{delta}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {charts.map((chart) => (
          <div key={chart.title} className="rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{chart.title}</h2>
                <p className="text-sm text-muted-foreground">{chart.description}</p>
              </div>

              <button className="rounded-lg border px-3 py-1 text-xs hover:bg-muted">
                View
              </button>
            </div>

            <div className="mt-6 flex h-56 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
              Analytics visualization area
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Revenue Intelligence</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            ["Pipeline Value", "$182,000"],
            ["Forecasted Revenue", "$64,000"],
            ["Average Deal Size", "$12,400"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-muted p-5">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
