"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { FeatureGate } from "@/components/features/feature-gate"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SequencesPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [sequences, setSequences] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [selectedContact, setSelectedContact] = useState("")

  async function load() {
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
    setWorkspace(workspaceData.workspace)

    if (!workspaceData.workspace?.id) return

    const sequenceResponse = await fetch("/api/outbound/sequences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: workspaceData.workspace.id }),
    })

    const sequenceData = await sequenceResponse.json()
    setSequences(sequenceData.sequences || [])

    const contactsResponse = await fetch("/api/crm/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: workspaceData.workspace.id }),
    })

    const contactsData = await contactsResponse.json()
    setContacts(contactsData.contacts || [])
  }

  async function enroll(sequenceId: string) {
    if (!workspace?.id || !selectedContact) {
      alert("Select a contact first")
      return
    }

    const response = await fetch("/api/outbound/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: workspace.id,
        sequenceId,
        contactId: selectedContact,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      alert(data.error || "Enrollment failed")
      return
    }

    alert("Contact enrolled in sequence")
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <FeatureGate
      feature="campaigns"
      title="Sequences require campaign access"
      description="Upgrade to manage outbound sequences, enroll contacts, and automate follow-up."
    >
      <main className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Outbound Sequences</h1>
          <p className="text-sm text-muted-foreground">
            Build structured multi-step outreach flows and enroll CRM contacts.
          </p>
        </div>

        <section className="rounded-xl border p-6 space-y-3">
          <h2 className="text-lg font-semibold">Enroll contact</h2>

          <select
            value={selectedContact}
            onChange={(event) => setSelectedContact(event.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select contact</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {[contact.first_name, contact.last_name].filter(Boolean).join(" ")} · {contact.email || "No email"}
              </option>
            ))}
          </select>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {sequences.map((sequence) => (
            <div key={sequence.id} className="rounded-xl border p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold">{sequence.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {sequence.description}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Status: {sequence.status}
                </p>
              </div>

              <div className="space-y-3">
                {(sequence.outbound_sequence_steps || [])
                  .sort((a: any, b: any) => a.step_order - b.step_order)
                  .map((step: any) => (
                    <div key={step.id} className="rounded-lg border p-4">
                      <p className="font-medium">
                        Step {step.step_order} · Day {step.delay_days}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {step.subject}
                      </p>
                    </div>
                  ))}
              </div>

              <button
                onClick={() => enroll(sequence.id)}
                className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90"
              >
                Enroll Selected Contact
              </button>
            </div>
          ))}
        </section>
      </main>
    </FeatureGate>
  )
}
