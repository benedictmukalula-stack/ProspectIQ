"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function ProfilePage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email || "")
      setName(data.session?.user?.user_metadata?.full_name || "")
    })
  }, [])

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account identity and preferences.</p>
      </div>

      <section className="rounded-xl border p-6 space-y-4 max-w-2xl">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Full name</span>
          <input className="w-full rounded-lg border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Email</span>
          <input className="w-full rounded-lg border px-3 py-2 bg-muted" value={email} disabled />
        </label>

        <button
          className="rounded-lg bg-black px-4 py-2 text-sm text-white"
          onClick={async () => {
            const { error } = await supabase.auth.updateUser({ data: { full_name: name } })
            setMessage(error ? error.message : "Profile updated.")
          }}
        >
          Save Profile
        </button>

        {message && <p className="text-sm">{message}</p>}
      </section>
    </main>
  )
}
