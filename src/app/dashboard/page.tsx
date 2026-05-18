const executiveMetrics = [
  ["Pipeline Value", "$182K", "+24% forecast lift"],
  ["Qualified Leads", "128", "+18 this week"],
  ["Outbound Engine", "Operational", "Mock provider active"],
  ["AI Productivity", "6 workflows", "4 active automations"],
]

const commandModules = [
  ["AI Assistant", "/dashboard/ai-assistant", "Ask ProspectIQ for next-best actions, lead prioritization, and campaign strategy.", "AI"],
  ["Leads Intelligence", "/dashboard/leads", "Prioritize prospects by score, intent, source, and recommended next action.", "CRM"],
  ["Companies", "/dashboard/companies", "Analyze target accounts, fit, contacts, tech stack, and expansion potential.", "Accounts"],
  ["CRM Pipeline", "/dashboard/crm/pipeline", "Manage opportunities, stage movement, forecast value, and deal intelligence.", "Revenue"],
  ["LinkedIn Research", "/dashboard/linkedin", "Research public profiles, extract signals, and create prospect records.", "Research"],
  ["Sequences", "/dashboard/sequences", "Enroll contacts into multi-step outbound automation workflows.", "Outbound"],
  ["Send Queue", "/dashboard/send-queue", "Build, simulate, and monitor outbound message delivery.", "Delivery"],
  ["Engagement", "/dashboard/engagement", "Track opens, clicks, replies, and engagement signals.", "Signals"],
  ["Reports", "/dashboard/reports", "Export executive reports, pipeline summaries, and CRM intelligence.", "Reporting"],
  ["Integrations", "/dashboard/integrations", "Manage providers, API readiness, AI integrations, and production checklist.", "Ops"],
]

const healthItems = [
  ["Workspace", "Active", "Business plan enabled"],
  ["Supabase", "Connected", "Auth and database online"],
  ["Queue Engine", "Operational", "Enrollment and send queue verified"],
  ["Engagement", "Active", "Manual events recorded"],
  ["Email Provider", "Mock Mode", "Connect Resend or SES next"],
  ["Security", "Review Needed", "RLS hardening required before production"],
]

const recommendations = [
  {
    title: "Connect real outbound provider",
    body: "Replace mock delivery with Resend or Amazon SES to enable production email sending.",
    href: "/dashboard/integrations",
  },
  {
    title: "Enable workspace security policies",
    body: "Implement Supabase RLS and role enforcement before opening team access broadly.",
    href: "/dashboard/security",
  },
  {
    title: "Move analytics to live executive reporting",
    body: "Continue replacing static estimates with live campaign, CRM, and engagement aggregation.",
    href: "/dashboard/analytics",
  },
]

const launchChecklist = [
  ["Workspace setup", true],
  ["Outbound sequences", true],
  ["Send queue", true],
  ["Engagement tracking", true],
  ["Team admin", true],
  ["Production email", false],
  ["Stripe live billing", false],
  ["RLS policies", false],
]

export default function DashboardPage() {
  const completed = launchChecklist.filter(([, done]) => done).length
  const readiness = Math.round((completed / launchChecklist.length) * 100)

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white">
        <div className="grid gap-8 xl:grid-cols-[1.5fr_0.8fr]">
          <div>
            <p className="text-sm text-slate-300">ProspectIQ Enterprise Command Center</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              AI Sales Intelligence Operating System
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
              Centralize sales intelligence, CRM execution, outbound automation, engagement signals,
              AI workflows, executive reporting, and production readiness from one workspace.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/dashboard/ai-assistant" className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black">
                Ask AI Assistant
              </a>
              <a href="/dashboard/leads" className="rounded-xl border border-white/20 px-4 py-2 text-sm">
                Prioritize Leads
              </a>
              <a href="/dashboard/sequences" className="rounded-xl border border-white/20 px-4 py-2 text-sm">
                Launch Sequence
              </a>
              <a href="/dashboard/reports" className="rounded-xl border border-white/20 px-4 py-2 text-sm">
                Executive Reports
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-300">Production Readiness</p>
            <p className="mt-3 text-5xl font-bold">{readiness}%</p>
            <p className="mt-2 text-sm text-slate-400">
              {completed} of {launchChecklist.length} launch systems complete
            </p>

            <div className="mt-5 space-y-2">
              {launchChecklist.map(([label, done]) => (
                <div key={String(label)} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{label}</span>
                  <span className={done ? "text-green-300" : "text-yellow-300"}>
                    {done ? "Ready" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {executiveMetrics.map(([label, value, note]) => (
          <div key={label} className="rounded-2xl border p-6">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{note}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <div className="rounded-2xl border p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Command Modules</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Jump into each operating layer of ProspectIQ.
              </p>
            </div>

            <a href="/dashboard/settings" className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
              Workspace Settings
            </a>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {commandModules.map(([title, href, description, tag]) => (
              <a key={title} href={href} className="rounded-2xl border p-5 transition hover:bg-muted">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold">{title}</h3>
                  <span className="rounded-full border px-2 py-0.5 text-xs">{tag}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{description}</p>
              </a>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">Operational Health</h2>

            <div className="mt-5 space-y-4">
              {healthItems.map(([label, status, note]) => (
                <div key={label} className="border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="rounded-full border px-2 py-0.5 text-xs">{status}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">AI Recommendations</h2>

            <div className="mt-5 space-y-4">
              {recommendations.map((item) => (
                <a key={item.title} href={item.href} className="block rounded-xl border p-4 hover:bg-muted">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Pipeline Intelligence</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Track revenue opportunities, stage movement, and weighted deal value.
          </p>
          <div className="mt-5 rounded-xl bg-muted p-5">
            <p className="text-sm text-muted-foreground">Weighted Forecast</p>
            <p className="mt-2 text-3xl font-semibold">$64K</p>
          </div>
          <a href="/dashboard/crm/pipeline" className="mt-5 inline-flex rounded-lg border px-4 py-2 text-sm hover:bg-muted">
            Open Pipeline
          </a>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Outbound Intelligence</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Monitor sequence enrollment, queued messages, simulated sends, and engagement.
          </p>
          <div className="mt-5 rounded-xl bg-muted p-5">
            <p className="text-sm text-muted-foreground">Delivery Mode</p>
            <p className="mt-2 text-3xl font-semibold">Mock</p>
          </div>
          <a href="/dashboard/send-queue" className="mt-5 inline-flex rounded-lg border px-4 py-2 text-sm hover:bg-muted">
            Open Queue
          </a>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Executive Reporting</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Export CRM intelligence, account summaries, pipeline distribution, and campaign reports.
          </p>
          <div className="mt-5 rounded-xl bg-muted p-5">
            <p className="text-sm text-muted-foreground">Report Center</p>
            <p className="mt-2 text-3xl font-semibold">Active</p>
          </div>
          <a href="/dashboard/reports" className="mt-5 inline-flex rounded-lg border px-4 py-2 text-sm hover:bg-muted">
            Open Reports
          </a>
        </div>
      </section>
    </main>
  )
}
