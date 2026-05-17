"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function BillingPage() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  const [billing, setBilling] = useState({
    plan: "free",
    status: "inactive",
  })

  async function loadBilling() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    setSession(session)

    if (!session?.user) {
      setLoading(false)
      return
    }

    if (session.user.email === "benedict.mukalula@gmail.com") {
      setBilling({
        plan: "business",
        status: "active",
      })

      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/billing/current-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          email: session.user.email,
        }),
      })

      const data = await response.json()

      setBilling({
        plan: data.plan || "free",
        status: data.status || "inactive",
      })
    } catch (error) {
      console.error(error)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadBilling()
  }, [])

  if (loading) {
    return (
      <main className="p-6">
        <p>Loading billing...</p>
      </main>
    )
  }

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Choose a plan, manage your subscription, update payment methods, and view invoices.
        </p>
      </div>

      <section className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Current account</h2>

        <div className="mt-4 space-y-2 text-sm">
          <p>
            <span className="font-medium">User:</span>{" "}
            {session?.user?.email}
          </p>

          <p>
            <span className="font-medium">Plan:</span>{" "}
            <span className="capitalize">
              {billing.plan}
            </span>{" "}
            · {billing.status}
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-6">
          <h3 className="text-lg font-semibold">Free</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Basic access for testing ProspectIQ.
          </p>

          <div className="mt-4">
            <p className="text-3xl font-bold">$0</p>
            <p className="text-sm text-muted-foreground">per month</p>
          </div>

          <ul className="mt-6 space-y-2 text-sm">
            <li>✓ Dashboard access</li>
            <li>✓ Basic lead view</li>
            <li>✓ Manual workflows</li>
          </ul>

          <button className="mt-6 w-full rounded-lg border px-4 py-2 text-sm">
            {billing.plan === "free" ? "Current Plan" : "Downgrade"}
          </button>
        </div>

        <div className="rounded-xl border p-6">
          <h3 className="text-lg font-semibold">Pro</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            For solo operators and growing sales teams.
          </p>

          <div className="mt-4">
            <p className="text-3xl font-bold">$29</p>
            <p className="text-sm text-muted-foreground">per month</p>
          </div>

          <ul className="mt-6 space-y-2 text-sm">
            <li>✓ AI workflows</li>
            <li>✓ Campaign automation</li>
            <li>✓ Lead enrichment</li>
            <li>✓ Pipeline tools</li>
          </ul>

          <button className="mt-6 w-full rounded-lg border px-4 py-2 text-sm">
            {billing.plan === "pro" ? "Current Plan" : "Upgrade to Pro"}
          </button>
        </div>

        <div className="rounded-xl border-2 border-black p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Business</h3>

            <span className="rounded-full bg-black px-3 py-1 text-xs text-white">
              ACTIVE
            </span>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            For teams that need advanced automation and controls.
          </p>

          <div className="mt-4">
            <p className="text-3xl font-bold">$79</p>
            <p className="text-sm text-muted-foreground">per month</p>
          </div>

          <ul className="mt-6 space-y-2 text-sm">
            <li>✓ Everything in Pro</li>
            <li>✓ Team controls</li>
            <li>✓ Advanced analytics</li>
            <li>✓ Priority workflows</li>
          </ul>

          <button className="mt-6 w-full rounded-lg bg-black px-4 py-2 text-sm text-white">
            {billing.plan === "business"
              ? "Current Plan"
              : "Upgrade to Business"}
          </button>
        </div>
      </section>

      <section className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold">
          Manage existing subscription
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Cancel subscription, update card details, download invoices, and edit billing information.
        </p>

        <button className="mt-6 rounded-lg border px-4 py-2 text-sm">
          Manage Billing
        </button>
      </section>
    </main>
  )
}
