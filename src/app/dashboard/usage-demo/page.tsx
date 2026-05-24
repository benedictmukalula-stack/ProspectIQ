"use client"

import { useState } from "react"
import { trackUsage, type UsageEventType } from "../lib/usage/track-usage"
import { UpgradeRequired } from "../components/billing/upgrade-required"

const demoUserId = null

const actions: {
  label: string
  eventType: UsageEventType
  description: string
}[] = [
  {
    label: "Run AI prompt",
    eventType: "ai_prompts",
    description: "Simulates using AI assistant credits.",
  },
  {
    label: "Enrich lead",
    eventType: "lead_enrichments",
    description: "Simulates LinkedIn/contact enrichment usage.",
  },
  {
    label: "Export leads",
    eventType: "exports",
    description: "Simulates exporting prospects or CRM data.",
  },
  {
    label: "Create campaign",
    eventType: "campaigns",
    description: "Simulates campaign creation limit enforcement.",
  },
]

export default function UsageDemoPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  async function runAction(eventType: UsageEventType) {
    setLoading(eventType)
    setResult(null)

    const response = await trackUsage({
      userId: demoUserId as any,
      eventType,
      quantity: 1,
      metadata: {
        source: "usage-demo",
      },
    })

    setResult(response.data)
    setLoading(null)
  }

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Usage Enforcement Demo</h1>
        <p className="text-sm text-muted-foreground">
          Test subscription-aware metering before wiring limits into live ProspectIQ actions.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {actions.map((action) => (
          <div key={action.eventType} className="rounded-xl border p-6 space-y-3">
            <div>
              <h2 className="text-lg font-semibold">{action.label}</h2>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </div>

            <button
              onClick={() => runAction(action.eventType)}
              disabled={loading === action.eventType}
              className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading === action.eventType ? "Checking..." : "Test Action"}
            </button>
          </div>
        ))}
      </section>

      {result?.allowed === false && (
        <UpgradeRequired
          title="Plan limit reached"
          message={`${result.eventType} limit reached for your ${result.plan} plan. Used ${result.used} of ${result.limit}.`}
        />
      )}

      {result?.allowed === true && (
        <div className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Usage allowed</h2>
          <p className="text-sm text-muted-foreground">
            Plan: {result.plan} · Usage: {result.used} / {result.limit}
          </p>
        </div>
      )}

      {result?.error && result?.allowed !== false && (
        <div className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Usage check error</h2>
          <p className="text-sm text-muted-foreground">{result.error}</p>
        </div>
      )}
    </main>
  )
}
