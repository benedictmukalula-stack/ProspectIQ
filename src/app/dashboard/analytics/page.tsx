"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AnalyticsPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [queue, setQueue] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [workflows, setWorkflows] = useState<any[]>([])
  const [runs, setRuns] = useState<any[]>([])
  const [message, setMessage] = useState("Loading analytics...")

  async function loadAnalytics() {
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
      setMessage("Workspace not found.")
      return
    }

    const [queueResponse, workflowsResponse, runsResponse] = await Promise.all([
      fetch("/api/outbound/send-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: currentWorkspace.id }),
      }),
      fetch("/api/ai/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: currentWorkspace.id }),
      }),
      fetch("/api/ai/workflow-runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: currentWorkspace.id }),
      }),
    ])

    const queueData = await queueResponse.json()
    const workflowsData = await workflowsResponse.json()
    const runsData = await runsResponse.json()

    setQueue(queueData.queue || [])
    setWorkflows(workflowsData.workflows || [])
    setRuns(runsData.runs || [])

    const { data: engagementEvents } = await supabase
      .from("outbound_engagement_events")
      .select("*")
      .eq("workspace_id", currentWorkspace.id)
      .order("created_at", { ascending: true })

    setEvents(engagementEvents || [])
    setMessage("")
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  const sentCount = queue.filter((item) => item.status === "sent").length
  const queuedCount = queue.filter((item) => item.status === "queued").length
  const openCount = events.filter((event) => event.event_type === "opened").length
  const clickCount = events.filter((event) => event.event_type === "clicked").length
  const replyCount = events.filter((event) => event.event_type === "replied").length

  const openRate = sentCount ? Math.round((openCount / sentCount) * 100) : 0
  const clickRate = sentCount ? Math.round((clickCount / sentCount) * 100) : 0
  const replyRate = sentCount ? Math.round((replyCount / sentCount) * 100) : 0

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {}
    queue.forEach((item) => {
      counts[item.status || "unknown"] = (counts[item.status || "unknown"] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [queue])

  const engagementData = useMemo(() => {
    const counts: Record<string, number> = {}
    events.forEach((event) => {
      counts[event.event_type || "unknown"] = (counts[event.event_type || "unknown"] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [events])

  const workflowData = useMemo(() => {
    const counts: Record<string, number> = {}
    runs.forEach((run) => {
      counts[run.action_type || run.status || "workflow"] = (counts[run.action_type || run.status || "workflow"] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [runs])

  const trendData = useMemo(() => {
    const grouped: Record<string, any> = {}
    events.forEach((event) => {
      const date = new Date(event.created_at).toLocaleDateString()
      grouped[date] ||= { date, opened: 0, clicked: 0, replied: 0 }
      if (event.event_type === "opened") grouped[date].opened += 1
      if (event.event_type === "clicked") grouped[date].clicked += 1
      if (event.event_type === "replied") grouped[date].replied += 1
    })
    return Object.values(grouped)
  }, [events])

  return (
    <main className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Live performance intelligence across queue delivery, engagement, and AI workflows.
          </p>
        </div>

        <button onClick={loadAnalytics} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
          Refresh Analytics
        </button>
      </div>

      {message && <div className="rounded-xl border p-4 text-sm">{message}</div>}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Sent Emails", sentCount],
          ["Queued Emails", queuedCount],
          ["Open Rate", `${openRate}%`],
          ["Reply Rate", `${replyRate}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border p-6">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Queue Status</h2>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Engagement Breakdown</h2>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={engagementData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {engagementData.map((_, index) => (
                    <Cell key={index} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Engagement Trend</h2>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="opened" />
                <Line type="monotone" dataKey="clicked" />
                <Line type="monotone" dataKey="replied" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">AI Workflow Runs</h2>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workflowData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Workspace Summary</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-muted p-4">
            <p className="text-sm text-muted-foreground">Workspace</p>
            <p className="mt-1 font-medium">{workspace?.name || "Unknown"}</p>
          </div>
          <div className="rounded-xl bg-muted p-4">
            <p className="text-sm text-muted-foreground">AI Workflows</p>
            <p className="mt-1 font-medium">{workflows.length}</p>
          </div>
          <div className="rounded-xl bg-muted p-4">
            <p className="text-sm text-muted-foreground">Click Rate</p>
            <p className="mt-1 font-medium">{clickRate}%</p>
          </div>
        </div>
      </section>
    </main>
  )
}