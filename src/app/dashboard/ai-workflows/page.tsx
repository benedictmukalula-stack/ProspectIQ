"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { FeatureGate } from "@/components/features/feature-gate"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AIWorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([])

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

      const response = await fetch("/api/ai/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: workspaceData.workspace.id }),
      })

      const data = await response.json()
      setWorkflows(data.workflows || [])
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
            <div key={workflow.id} className="rounded-xl border p-6 space-y-2">
              <h2 className="text-lg font-semibold">{workflow.name}</h2>
              <p className="text-sm text-muted-foreground">
                {workflow.description}
              </p>
              <p className="text-xs text-muted-foreground">
                Action: {workflow.action_type} · Status: {workflow.status}
              </p>
            </div>
          ))}
        </section>
      </main>
    </FeatureGate>
  )
}
