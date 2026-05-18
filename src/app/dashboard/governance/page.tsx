"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function GovernancePage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [approvals, setApprovals] = useState<any[]>([])
  const [message, setMessage] = useState("Loading AI governance center...")

  async function loadApprovals() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const workspaceResponse = await fetch("/api/workspace/current", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

    const response = await fetch(
      `/api/governance/approvals?workspaceId=${currentWorkspace.id}`,
      { cache: "no-store" }
    )

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.error || "Failed to load approvals.")
      return
    }

    setApprovals(data.approvals || [])
    setMessage("")
  }

  async function updateApproval(approvalId: string, status: string) {
    const response = await fetch("/api/governance/approvals", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        approvalId,
        status,
        reviewedBy: "workspace_admin",
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.error || "Failed to update approval.")
      return
    }

    setApprovals((current) =>
      current.map((item) =>
        item.id === approvalId ? data.approval : item
      )
    )
  }

  async function seedApproval() {
    if (!workspace?.id) return

    const response = await fetch("/api/governance/approvals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workspaceId: workspace.id,
        title: "Approve AI-generated follow-up task creation",
        category: "operations",
        priority: "medium",
        actionType: "task_create",
        source: "governance_console",
        confidence: 82,
        payload: {
          module: "tasks",
          reason: "Engagement signals indicate follow-up opportunity.",
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.error || "Failed to create approval.")
      return
    }

    setApprovals((current) => [data.approval, ...current])
  }

  useEffect(() => {
    loadApprovals()
  }, [])

  const stats = useMemo(() => {
    return {
      total: approvals.length,
      pending: approvals.filter((item) => item.status === "pending").length,
      approved: approvals.filter((item) => item.status === "approved").length,
      blocked: approvals.filter((item) => item.status === "blocked").length,
      rejected: approvals.filter((item) => item.status === "rejected").length,
    }
  }, [approvals])

  return (
    <main className="space-y-8">
      <section className="rounded-2xl border bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
        <p className="text-sm text-slate-300">
          Enterprise AI Governance
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Human Approval Center
        </h1>

        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Review autonomous AI execution requests, enforce policy decisions,
          approve safe operations, reject risky actions, and audit AI governance.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {[
            ["Total", stats.total],
            ["Pending", stats.pending],
            ["Approved", stats.approved],
            ["Blocked", stats.blocked],
            ["Rejected", stats.rejected],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <p className="text-xs text-slate-300">{label}</p>
              <p className="mt-2 text-3xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Workspace: {workspace?.name || "Loading..."}
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={seedApproval}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
          >
            Create Test Approval
          </button>

          <button
            onClick={loadApprovals}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
          >
            Refresh Governance
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border p-4 text-sm">
          {message}
        </div>
      )}

      <section className="rounded-2xl border divide-y">
        {approvals.length ? (
          approvals.map((approval) => (
            <article
              key={approval.id}
              className="grid gap-4 p-5 xl:grid-cols-[1fr_auto]"
            >
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border px-2 py-0.5 text-xs">
                    {approval.category}
                  </span>

                  <span className="rounded-full border px-2 py-0.5 text-xs">
                    {approval.priority}
                  </span>

                  <span className="rounded-full border px-2 py-0.5 text-xs">
                    {approval.status}
                  </span>

                  <span className="rounded-full border px-2 py-0.5 text-xs">
                    confidence {approval.confidence}%
                  </span>
                </div>

                <h2 className="mt-3 font-semibold">
                  {approval.title}
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Decision: {approval.decision?.outcome || "pending"} · Risk:{" "}
                  {approval.decision?.risk || "unknown"}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {approval.decision?.reason}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  Created: {new Date(approval.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-wrap items-start gap-2 xl:justify-end">
                {approval.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateApproval(approval.id, "approved")}
                      className="rounded-lg bg-black px-4 py-2 text-sm text-white"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => updateApproval(approval.id, "rejected")}
                      className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
                    >
                      Reject
                    </button>

                    <button
                      onClick={() => updateApproval(approval.id, "blocked")}
                      className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
                    >
                      Block
                    </button>
                  </>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="p-8 text-sm text-muted-foreground">
            No AI approval requests yet.
          </div>
        )}
      </section>
    </main>
  )
}
