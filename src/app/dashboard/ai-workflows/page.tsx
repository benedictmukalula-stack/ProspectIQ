"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { FeatureGate } from "@/components/features/feature-gate"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AIWorkflowsPage() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [workflows, setWorkflows] = useState<any[]>([])
  const [runs, setRuns] = useState<any[]>([])
  const [loading, setLoading] = useState<string | null>(null)

  async function loadRuns(id: string) {
    const response = await fetch("/api/ai/workflow-runs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workspaceId: id,
      }),
    })

    const data = await response.json()
    setRuns(data.runs || [])
  }

  async function executeWorkflow(workflowId: string) {
    setLoading(workflowId)

    await fetch("/api/ai/run-workflow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        workflowId,
      }),
    })

    if (workspaceId) {
      await loadRuns(workspaceId)
    }

    setLoading(null)
  }

  useEffect(() => {
    async function loadWorkflows() {
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

      if (!workspaceResponse.ok || !workspaceData.workspace?.id) return

      setWorkspaceId(workspaceData.workspace.id)

      const response = await fetch("/api/ai/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspaceData.workspace.id,
        }),
      })

      const data = await response.json()
      setWorkflows(data.workflows || [])

      await loadRuns(workspaceData.workspace.id)
    }

    loadWorkflows()
  }, [])

  return (
    <FeatureGate
      feature="ai_assistant"
      title="AI workflows require account access"
      description="Use ProspectIQ AI workflows to score leads, generate outreach, and automate CRM actions."
    >
      <main className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">AI Workflows</h1>
          <p className="text-sm text-muted-foreground">
            Build AI-powered sales workflows for scoring, enrichment, drafting, and routing.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="rounded-xl border p-6 space-y-3">
              <div>
                <h2 className="text-lg font-semibold">
                  {workflow.name}
                </h2>

                <p className="text-sm text-muted-foreground">
                  {workflow.description}
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                Action: {workflow.action_type} · Status: {workflow.status}
              </p>

              <button
                onClick={() => executeWorkflow(workflow.id)}
                disabled={loading === workflow.id}
                className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
              >
                {loading === workflow.id
                  ? "Running..."
                  : "Run Workflow"}
              </button>
            </div>
          ))}
        </section>

        <section className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">
            Workflow Runs
          </h2>

          <div className="mt-4 space-y-3">
            {runs.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No workflow runs yet.
              </p>
            )}

            {runs.map((run) => (
              <div
                key={run.id}
                className="rounded-lg border p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {run.ai_workflows?.name || "Workflow"}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {run.ai_workflows?.action_type}
                    </p>
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {run.status}
                  </span>
                </div>

                {run.output && (
                  <pre className="overflow-auto rounded bg-muted p-3 text-xs">
                    {JSON.stringify(run.output, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </FeatureGate>
  )
}
