"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function FeatureGate({
  feature,
  title,
  description,
  children,
}: {
  feature: string
  title?: string
  description?: string
  children: React.ReactNode
}) {
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [plan, setPlan] = useState<string>("free")

  useEffect(() => {
    async function checkAccess() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const response = await fetch("/api/features/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          email: session?.user?.email,
          feature,
        }),
      })

      const data = await response.json()

      setAllowed(data.allowed)
      setPlan(data.plan || "free")
    }

    checkAccess()
  }, [feature])

  if (allowed === null) {
    return (
      <div className="rounded-xl border p-6">
        <p className="text-sm text-muted-foreground">
          Checking feature access...
        </p>
      </div>
    )
  }

  if (!allowed) {
    return (
      <div className="rounded-xl border border-dashed p-8 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            {title || "Upgrade required"}
          </h2>

          <p className="text-sm text-muted-foreground mt-2">
            {description ||
              `Your current ${plan} plan does not include access to this feature.`}
          </p>
        </div>

        <Link
          href="/dashboard/billing"
          className="inline-flex rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90"
        >
          Upgrade Plan
        </Link>
      </div>
    )
  }

  return <>{children}</>
}
