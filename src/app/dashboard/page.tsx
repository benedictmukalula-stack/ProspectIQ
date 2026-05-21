"use client"

import { ExecutiveHero } from "@/components/system-ui/executive-hero"
import { EnterpriseCard } from "@/components/system-ui/enterprise-card"
import { useEffect, useMemo, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const commandModules = [
  ["AI Assistant", "/dashboard/ai-assistant", "Ask ProspectIQ for next-best actions, lead prioritization, and campaign strategy.", "AI"],
  ["Revenue Command", "/dashboard/revenue-command", "Unified AI revenue operations dashboard with agent insights, lead intelligence, pipeline health, and autonomous action recommendations.", "Revenue OS"],
  ["Boardroom Intelligence", "/dashboard/executive", "Board-ready KPIs, executive briefing, strategic actions, and revenue health intelligence.", "Boardroom"],
  ["Executive Governance", "/dashboard/governance", "Supervised autonomy, approval controls, execution permissions, and AI governance decisions.", "Governance"],
  ["Revenue Forecasting", "/dashboard/predictions", "Pipeline outlook, conversion forecast, revenue risk, and projected growth signals.", "Forecast"],
  ["Strategic Simulation", "/dashboard/simulation", "Model GTM scenarios, delivery risks, sequence changes, and vertical-focus outcomes.", "Simulation"],
  ["Runtime Execution", "/dashboard/execution", "Autonomous runtime executor, policy enforcement, queue governance, and live operational actions.", "Runtime"],
  ["Platform Intelligence", "/dashboard/benchmarks", "Cross-workspace intelligence, industry benchmarks, vertical performance, and platform learning.", "Mesh"],
  ["Commercial Usage", "/dashboard/usage", "AI credit metering, plan entitlements, usage health, and commercial SaaS limits.", "Commercial"],
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

export default function DashboardPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [intelligence, setIntelligence] = useState<any>(null)
  const [activityEvents, setActivityEvents] = useState<any[]>([])
  const [queueMetrics, setQueueMetrics] = useState<any>({
    processed: 0,
    delivered: 0,
    failed: 0,
  })
  const [systemPulse, setSystemPulse] = useState<any>({
    activityEvents: 0,
    engagementEvents: 0,
    queueOperations: 0,
    systemStatus: "loading",
  })
  const [message, setMessage] = useState("Loading live workspace intelligence...")

  async function loadDashboard() {
    setMessage("Loading live workspace intelligence...")

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const workspaceResponse = await fetch("/api/workspace/current", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session?.user?.id,
        email: session?.user?.email,
      }),
    })

    const workspaceData = await workspaceResponse.json()
    const currentWorkspace = workspaceData.workspace
    setWorkspace(currentWorkspace)

    if (!currentWorkspace?.id) {
      setMessage("Workspace not found. Sign in again to load dashboard intelligence.")
      return
    }

    const intelligenceResponse = await fetch("/api/dashboard/intelligence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: currentWorkspace.id }),
    })

    const intelligenceData = await intelligenceResponse.json()

    if (!intelligenceResponse.ok) {
      setMessage(intelligenceData.error || "Failed to load dashboard intelligence.")
      return
    }

    setIntelligence(intelligenceData.intelligence)

    const activityResponse = await fetch("/api/activity/feed")
    const activityData = await activityResponse.json()

    if (activityData.success) {
      setActivityEvents(activityData.events || [])
    }

    const metricsResponse =
      await fetch("/api/metrics/queue")

    const metricsData =
      await metricsResponse.json()

    if (metricsData.success) {
      setQueueMetrics(
        metricsData.metrics
      )
    }

    const pulseResponse =
      await fetch("/api/system/pulse")

    const pulseData =
      await pulseResponse.json()

    if (pulseData.success) {
      setSystemPulse(
        pulseData.pulse
      )
    }

    setMessage("")
  }

  useEffect(() => {
    loadDashboard()

    const interval = setInterval(() => {
      loadDashboard()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const summary = intelligence?.summary || {}
  const performance = intelligence?.performance || {}
  const health = intelligence?.health || {}
  const recommendations = intelligence?.recommendations || []

  const executiveMetrics = [
    ["CRM Contacts", summary.contacts ?? "...", "Live workspace contacts"],
    ["Active Sequences", summary.activeSequences ?? "...", `${summary.sequences ?? 0} total sequences`],
    [
      "Queue Throughput",
      queueMetrics.processed ?? 0,
      `${queueMetrics.delivered ?? 0} delivered · ${queueMetrics.failed ?? 0} failed`
    ],
    ["AI Workflows", summary.aiWorkflows ?? "...", `${summary.activeAiWorkflows ?? 0} active`],
  ]

  const healthItems = [
    ["Workspace", health.workspace || "loading", workspace?.plan ? `${workspace.plan} plan` : "Workspace resolved"],
    ["Supabase", health.supabase || "loading", "Auth and database status"],
    ["Queue Engine", health.queueEngine || "loading", "Enrollment and send queue"],
    ["Tracking", health.tracking || "loading", `${summary.engagementEvents ?? 0} engagement events`],
    ["Email Provider", health.emailProvider || "loading", "Production provider pending"],
    ["Security", health.security || "loading", "Review RLS before production"],
  ]

  const launchChecklist = useMemo(() => {
    return [
      ["Workspace setup", Boolean(workspace?.id)],
      ["Outbound sequences", Number(summary.sequences || 0) > 0],
      ["Send queue", Number(summary.sentEmails || 0) + Number(summary.queuedEmails || 0) > 0],
      ["Engagement tracking", Number(summary.engagementEvents || 0) > 0],
      ["Team admin", Number(summary.teamMembers || 0) > 0],
      ["Production email", health.emailProvider === "production"],
      ["Stripe live billing", false],
      ["RLS policies", health.security === "secured"],
    ]
  }, [workspace?.id, summary, health])

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
              Live workspace intelligence for CRM contacts, outbound sequences, queue delivery,
              engagement signals, AI workflows, team readiness, and production operations.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-slate-400">System Status</p>
                <p className="mt-1 text-sm font-semibold capitalize text-green-300">
                  {String(systemPulse.systemStatus).replaceAll("_", " ")}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-slate-400">Activity Events</p>
                <p className="mt-1 text-sm font-semibold">
                  {systemPulse.activityEvents ?? 0}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-slate-400">Engagement Events</p>
                <p className="mt-1 text-sm font-semibold">
                  {systemPulse.engagementEvents ?? 0}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-slate-400">Queue Operations</p>
                <p className="mt-1 text-sm font-semibold">
                  {systemPulse.queueOperations ?? 0}
                </p>
              </div>
            </div>

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
              <button onClick={loadDashboard} className="rounded-xl border border-white/20 px-4 py-2 text-sm">
                Refresh Intelligence
              </button>
            </div>

            {message && (
              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                {message}
              </div>
            )}
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
          <h2 className="text-xl font-semibold">Command Modules</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Jump into each operating layer of ProspectIQ.
          </p>

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
                    <span className="rounded-full border px-2 py-0.5 text-xs capitalize">
                      {String(status).replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">Live Activity Feed</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Realtime operational intelligence across outbound delivery,
              engagement, and AI systems.
            </p>

            <div className="mt-5 space-y-4">
              {activityEvents.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No activity events yet.
                </div>
              ) : (
                activityEvents.map((event) => (
                  <div key={event.id} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{event.title}</span>
                      <span className="rounded-full border px-2 py-0.5 text-xs capitalize">
                        {event.severity}
                      </span>
                    </div>

                    {event.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">AI Recommendations</h2>

            <div className="mt-5 space-y-4">
              {recommendations.map((item: any) => (
                <a key={item.title} href={item.href} className="block rounded-xl border p-4 hover:bg-muted">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{item.title}</p>
                    <span className="rounded-full border px-2 py-0.5 text-xs">{item.priority}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Engagement Intelligence</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Open, click, and reply metrics calculated from workspace engagement events.
          </p>
          <div className="mt-5 grid gap-3">
            <div className="rounded-xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Open Rate</p>
              <p className="mt-2 text-3xl font-semibold">{performance.openRate ?? 0}%</p>
            </div>
            <div className="rounded-xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Reply Rate</p>
              <p className="mt-2 text-3xl font-semibold">{performance.replyRate ?? 0}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Outbound Intelligence</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Live queue and delivery state from the outbound automation layer.
          </p>
          <div className="mt-5 rounded-xl bg-muted p-5">
            <p className="text-sm text-muted-foreground">Delivery Mode</p>
            <p className="mt-2 text-3xl font-semibold capitalize">
              {String(health.emailProvider || "mock_mode").replaceAll("_", " ")}
            </p>
          </div>
          <a href="/dashboard/send-queue" className="mt-5 inline-flex rounded-lg border px-4 py-2 text-sm hover:bg-muted">
            Open Queue
          </a>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Executive Reporting</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Reporting summaries now align with the central intelligence layer.
          </p>
          <div className="mt-5 rounded-xl bg-muted p-5">
            <p className="text-sm text-muted-foreground">AI Runs</p>
            <p className="mt-2 text-3xl font-semibold">{summary.aiRuns ?? 0}</p>
          </div>
          <a href="/dashboard/reports" className="mt-5 inline-flex rounded-lg border px-4 py-2 text-sm hover:bg-muted">
            Open Reports
          </a>
        </div>
      </section>
    </main>
  )
}
