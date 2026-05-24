"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { FeatureGate } from "../components/features/feature-gate"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SequencesPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [sequences, setSequences] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [selectedContact, setSelectedContact] = useState("")
  const [message, setMessage] = useState("Loading outbound intelligence...")
  const [selectedStatus, setSelectedStatus] = useState("all")

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

    if (!workspaceData.workspace?.id) {
      setMessage("Workspace unavailable.")
      return
    }

    const sequenceResponse = await fetch("/api/outbound/sequences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: workspaceData.workspace.id,
      }),
    })

    const sequenceData = await sequenceResponse.json()

    const contactsResponse = await fetch("/api/crm/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspaceId: workspaceData.workspace.id,
      }),
    })

    const contactsData = await contactsResponse.json()

    setSequences(sequenceData.sequences || [])
    setContacts(contactsData.contacts || [])
    setMessage("")
  }

  async function enroll(sequenceId: string) {
    if (!workspace?.id || !selectedContact) {
      setMessage("Select a CRM contact before enrollment.")
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
      setMessage(data.error || "Enrollment failed.")
      return
    }

    setMessage("Contact successfully enrolled into outbound sequence.")
  }

  useEffect(() => {
    load()
  }, [])

  const filteredSequences = useMemo(() => {
    if (selectedStatus === "all") return sequences

    return sequences.filter(
      (sequence) =>
        sequence.status?.toLowerCase() === selectedStatus.toLowerCase()
    )
  }, [sequences, selectedStatus])

  const totalSteps = sequences.reduce(
    (sum, sequence) =>
      sum + (sequence.outbound_sequence_steps || []).length,
    0
  )

  return (
    <FeatureGate
      feature="campaigns"
      title="Sequences require campaign access"
      description="Upgrade to automate multi-step outbound campaigns and CRM enrollment."
    >
      <main className="space-y-8">
        <section className="rounded-2xl border bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
          <p className="text-sm text-slate-300">
            Outbound Automation
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Premium Sequences Builder
          </h1>

          <p className="mt-3 max-w-3xl text-sm text-slate-300">
            Manage AI-assisted outreach sequences, enroll CRM contacts,
            monitor follow-up structure, and scale outbound engagement.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              ["Sequences", sequences.length],
              ["CRM Contacts", contacts.length],
              ["Sequence Steps", totalSteps],
              [
                "Active Sequences",
                sequences.filter((s) => s.status === "active").length,
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-xs text-slate-300">{label}</p>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {message && (
          <div className="rounded-xl border p-4 text-sm">
            {message}
          </div>
        )}

        <section className="grid gap-4 rounded-xl border p-6 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 className="text-lg font-semibold">
              Enroll CRM Contact
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Add a CRM contact into a structured outbound sequence.
            </p>

            <select
              value={selectedContact}
              onChange={(event) =>
                setSelectedContact(event.target.value)
              }
              className="mt-4 w-full rounded-xl border px-4 py-3 text-sm"
            >
              <option value="">Select contact</option>

              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {[contact.first_name, contact.last_name]
                    .filter(Boolean)
                    .join(" ")}{" "}
                  · {contact.email || "No email"}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value)
              }
              className="rounded-xl border px-4 py-3 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          {filteredSequences.map((sequence) => (
            <article
              key={sequence.id}
              className="rounded-2xl border p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border px-2 py-0.5 text-xs">
                      {sequence.status}
                    </span>

                    <span className="rounded-full border px-2 py-0.5 text-xs">
                      {(sequence.outbound_sequence_steps || []).length} steps
                    </span>
                  </div>

                  <h2 className="mt-3 text-xl font-semibold">
                    {sequence.name}
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {sequence.description ||
                      "AI-assisted outbound engagement sequence."}
                  </p>
                </div>

                <div className="rounded-xl border p-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    Performance
                  </p>

                  <p className="mt-2 text-3xl font-semibold">
                    82%
                  </p>

                  <p className="text-xs text-muted-foreground">
                    engagement score
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {(sequence.outbound_sequence_steps || [])
                  .sort(
                    (a: any, b: any) =>
                      a.step_order - b.step_order
                  )
                  .map((step: any) => (
                    <div
                      key={step.id}
                      className="rounded-xl border bg-muted/40 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            Step {step.step_order}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            Day {step.delay_days} · {step.channel}
                          </p>
                        </div>

                        <span className="rounded-full border px-2 py-0.5 text-xs">
                          Active
                        </span>
                      </div>

                      <p className="mt-3 text-sm font-medium">
                        {step.subject}
                      </p>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {step.body?.slice(0, 140)}
                      </p>
                    </div>
                  ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => enroll(sequence.id)}
                  className="rounded-lg bg-black px-4 py-2 text-sm text-white"
                >
                  Enroll Contact
                </button>

                <button className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                  Edit Sequence
                </button>

                <button className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                  View Analytics
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </FeatureGate>
  )
}
