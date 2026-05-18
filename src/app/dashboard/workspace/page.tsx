"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function WorkspaceSettingsPage() {
  const [workspace, setWorkspace] = useState<any>(null)
  const [message, setMessage] = useState("")

  async function loadWorkspace() {
    const { data } = await supabase.auth.getSession()
    const response = await fetch("/api/workspace/current", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: data.session?.user?.id,
        email: data.session?.user?.email,
      }),
    })
    const result = await response.json()
    setWorkspace(result.workspace)
  }

  useEffect(() => {
    loadWorkspace()
  }, [])

  async function saveWorkspace() {
    if (!workspace?.id) return
    const { error } = await supabase.from("workspaces").update({ name: workspace.name }).eq("id", workspace.id)
    setMessage(error ? error.message : "Workspace updated.")
  }

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Workspace Settings</h1>
        <p className="text-sm text-muted-foreground">Manage workspace name, ownership, and plan visibility.</p>
      </div>

      <section className="rounded-xl border p-6 space-y-4 max-w-2xl">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Workspace name</span>
          <input className="w-full rounded-lg border px-3 py-2" value={workspace?.name || ""} onChange={(e) => setWorkspace({ ...workspace, name: e.target.value })} />
        </label>

        <div className="grid gap-3 rounded-lg bg-muted p-4 text-sm">
          <p><strong>Workspace ID:</strong> {workspace?.id || "Loading..."}</p>
          <p><strong>Plan:</strong> {workspace?.plan || "Loading..."}</p>
          <p><strong>Status:</strong> Active</p>
        </div>

        <button className="rounded-lg bg-black px-4 py-2 text-sm text-white" onClick={saveWorkspace}>
          Save Workspace
        </button>

        {message && <p className="text-sm">{message}</p>}
      </section>
    </main>
  )
}
