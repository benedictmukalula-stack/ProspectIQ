"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Basic access for testing ProspectIQ.",
    features: ["Dashboard access", "Basic lead view", "Manual workflows"],
    button: "Current Plan",
    endpoint: null,
  },
  {
    name: "Pro",
    price: "$29",
    description: "For solo operators and growing sales teams.",
    features: ["AI workflows", "Campaign automation", "Lead enrichment", "Pipeline tools"],
    button: "Upgrade to Pro",
    endpoint: "/api/stripe/checkout/pro",
  },
  {
    name: "Business",
    price: "$79",
    description: "For teams that need advanced automation and controls.",
    features: ["Everything in Pro", "Team controls", "Advanced analytics", "Priority workflows"],
    button: "Upgrade to Business",
    endpoint: "/api/stripe/checkout/business",
  },
]

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  async function startCheckout(endpoint: string, plan: string) {
    try {
      setLoading(plan)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
      })
      const data = await response.json()

      if (data?.url) {
        window.location.href = data.url
      } else {
        alert(data?.error || "Failed to start checkout")
      }
    } finally {
      setLoading(null)
    }
  }

  async function manageBilling() {
    try {
      setLoading("portal")

      const response = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await response.json()

      if (data?.url) {
        window.location.href = data.url
      } else {
        alert(data?.error || "Failed to open billing portal")
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Choose a plan, manage your subscription, update payment methods, and view invoices.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.name} className="rounded-xl border p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>

            <div>
              <p className="text-3xl font-bold">{plan.price}</p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>

            <ul className="space-y-2 text-sm">
              {plan.features.map((feature) => (
                <li key={feature}>✓ {feature}</li>
              ))}
            </ul>

            <button
              disabled={!plan.endpoint || loading === plan.name}
              onClick={() =>
                plan.endpoint && startCheckout(plan.endpoint, plan.name)
              }
              className="w-full rounded-lg bg-black px-4 py-2 text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading === plan.name ? "Redirecting..." : plan.button}
            </button>
          </div>
        ))}
      </section>

      <section className="rounded-xl border p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Manage existing subscription</h2>
          <p className="text-sm text-muted-foreground">
            Cancel subscription, update card details, download invoices, and edit billing information.
          </p>
        </div>

        <button
          onClick={manageBilling}
          disabled={loading === "portal"}
          className="rounded-lg border px-4 py-2 hover:bg-muted disabled:opacity-50"
        >
          {loading === "portal" ? "Opening..." : "Manage Billing"}
        </button>
      </section>
    </main>
  )
}
