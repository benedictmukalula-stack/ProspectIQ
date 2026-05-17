"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CRMPage() {
  const [contacts, setContacts] = useState<any[]>([])

  async function loadContacts() {
    const { data } = await supabase
      .from("crm_contacts")
      .select("*")
      .order("created_at", { ascending: false })

    setContacts(data || [])
  }

  useEffect(() => {
    loadContacts()
  }, [])

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">CRM</h1>

        <p className="text-sm text-muted-foreground">
          AI-enriched sales contacts, lifecycle stages, and lead intelligence.
        </p>
      </div>

      <section className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold">
          Contact intelligence
        </h2>

        <div className="mt-4 space-y-3">
          {contacts.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No CRM contacts yet.
            </p>
          )}

          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="rounded-lg border p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {contact.first_name || "Unknown"}{" "}
                    {contact.last_name || ""}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {contact.email || "No email"}
                  </p>
                </div>

                {contact.hot_lead && (
                  <span className="rounded-full bg-red-500 px-3 py-1 text-xs text-white">
                    HOT LEAD
                  </span>
                )}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">
                    Lead Score
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {contact.lead_score || 0}
                  </p>
                </div>

                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">
                    Lifecycle Stage
                  </p>

                  <p className="mt-1 text-sm font-medium capitalize">
                    {contact.lifecycle_stage || "lead"}
                  </p>
                </div>

                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">
                    Company
                  </p>

                  <p className="mt-1 text-sm">
                    {contact.company || "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
