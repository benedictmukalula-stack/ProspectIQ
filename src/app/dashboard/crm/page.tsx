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
  const [error, setError] = useState<string | null>(null)

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

    if (!workspaceResponse.ok) {
      setError(workspaceData.error || "Failed to load workspace")
      return
    }

    setWorkspace(workspaceData.workspace)

    const contactsResponse = await fetch("/api/crm/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: workspaceData.workspace.id }),
    })

    const contactsData = await contactsResponse.json()
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
            Persistent contacts, companies, deals, and sales activities.
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
        <div className="rounded-xl border p-4 text-sm">
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
              No contacts yet. Add sample CRM data to initialize the workspace.
            </p>
          )}

          {contacts.map((contact) => (
            <div key={contact.id} className="rounded-lg border p-4">
              <p className="font-medium">
                {[contact.first_name, contact.last_name].filter(Boolean).join(" ") || "Unnamed contact"}
              </p>
              <p className="text-sm text-muted-foreground">
                {contact.title || "No title"} · {contact.crm_companies?.name || "No company"}
              </p>
              <p className="text-xs text-muted-foreground">
                Score: {contact.score} · Status: {contact.status}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
