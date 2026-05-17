"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CRMPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [contacts, setContacts] = useState<any[]>([])
  const [error, setError] = useState("")

  async function loadCRM() {
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

    if (!workspaceResponse.ok || !workspaceData.workspace?.id) {
      setError(workspaceData.error || "Failed to load workspace")
      return
    }

    setWorkspace(workspaceData.workspace)

    const contactsResponse = await fetch("/api/crm/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: workspaceData.workspace.id,
      }),
    })

    const contactsData = await contactsResponse.json()

    if (!contactsResponse.ok) {
      setError(contactsData.error || "Failed to load contacts")
      return
    }

    setContacts(contactsData.contacts || [])
  }

  async function seedCRM() {
    if (!workspace?.id) return

    const response = await fetch("/api/crm/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: workspace.id }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error || "Seed failed")
      return
    }

    await loadCRM()
  }

  useEffect(() => {
    loadCRM()
  }, [])

  return (
    <main className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">CRM</h1>
          <p className="text-sm text-muted-foreground">
            AI-enriched sales contacts, lifecycle stages, and lead intelligence.
          </p>
        </div>

        <button
          onClick={seedCRM}
          className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90"
        >
          Add Sample CRM Data
        </button>
      </div>

      {error && (
        <div className="rounded-xl border p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <section className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Workspace</h2>
        <p className="text-sm text-muted-foreground">
          {workspace?.name || "Loading workspace..."}
        </p>
      </section>

      <section className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Contacts</h2>

        <div className="mt-4 space-y-3">
          {contacts.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No contacts yet. Click Add Sample CRM Data.
            </p>
          )}

          {contacts.map((contact) => (
            <div key={contact.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {[contact.first_name, contact.last_name].filter(Boolean).join(" ") || "Unnamed contact"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {contact.email || "No email"} · {contact.title || "No title"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {contact.crm_companies?.name || "No company"}
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
                  <p className="text-xs text-muted-foreground">Lead Score</p>
                  <p className="text-lg font-semibold">
                    {contact.lead_score || contact.score || 0}
                  </p>
                </div>

                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Lifecycle</p>
                  <p className="text-sm font-medium capitalize">
                    {contact.lifecycle_stage || "lead"}
                  </p>
                </div>

                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-medium capitalize">
                    {contact.status || "new"}
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
