const metrics = [
  ["Total Leads", "128", "+18 this week"],
  ["Active Sequences", "3", "2 running"],
  ["Queued Emails", "1", "Mock provider active"],
  ["AI Workflows", "6", "4 active"],
]

const modules = [
  ["AI Assistant", "/dashboard/ai-assistant", "Ask questions across leads, campaigns, CRM, and workflows."],
  ["LinkedIn Research", "/dashboard/linkedin", "Research prospects, extract profile signals, and create leads."],
  ["CRM Pipeline", "/dashboard/crm/pipeline", "Track opportunities across sales stages."],
  ["Sequences", "/dashboard/sequences", "Build and enroll contacts into outbound flows."],
  ["Send Queue", "/dashboard/send-queue", "Build, simulate, and monitor outbound delivery."],
  ["Engagement", "/dashboard/engagement", "Track opens, clicks, replies, and campaign signals."],
  ["AI Workflows", "/dashboard/ai-workflows", "Run scoring, drafting, enrichment, and routing automations."],
  ["Reports", "/dashboard/reports", "Export pipeline, activity, and campaign performance data."],
]

const health = [
  ["Workspace", "Active"],
  ["Plan", "Business"],
  ["Email Provider", "Mock mode"],
  ["Supabase", "Connected"],
  ["Queue Engine", "Operational"],
  ["Tracking", "Manual events active"],
]

export default function DashboardPage() {
  return (
    <main className="space-y-8">
      <section className="rounded-2xl border bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
        <p className="text-sm text-slate-300">ProspectIQ Command Center</p>
        <h1 className="mt-2 text-3xl font-bold">AI Sales Intelligence Dashboard</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Monitor leads, CRM activity, outbound automation, AI workflows, engagement, reports, and platform readiness from one workspace.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/dashboard/linkedin" className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black">
            Research Prospects
          </a>
          <a href="/dashboard/sequences" className="rounded-lg border border-white/20 px-4 py-2 text-sm">
            Manage Sequences
          </a>
          <a href="/dashboard/send-queue" className="rounded-lg border border-white/20 px-4 py-2 text-sm">
            Open Send Queue
          </a>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value, note]) => (
          <div key={label} className="rounded-xl border p-6">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{note}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Core Modules</h2>
          <p className="mt-1 text-sm text-muted-foreground">Jump into the main ProspectIQ workflows.</p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {modules.map(([title, href, description]) => (
              <a key={title} href={href} className="rounded-xl border p-4 transition hover:bg-muted">
                <h3 className="font-medium">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border p-6">
            <h2 className="text-lg font-semibold">Platform Health</h2>
            <div className="mt-4 space-y-3">
              {health.map(([label, status]) => (
                <div key={label} className="flex items-center justify-between border-b pb-2 text-sm last:border-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-6">
            <h2 className="text-lg font-semibold">Recommended Next Actions</h2>
            <div className="mt-4 space-y-3 text-sm">
              <p>1. Add real email provider integration.</p>
              <p>2. Connect Stripe production billing.</p>
              <p>3. Add Supabase RLS policies.</p>
              <p>4. Expand analytics and reporting widgets.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
