export default function SecurityPage() {
  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Security</h1>
        <p className="text-sm text-muted-foreground">Review account security, access controls, and workspace protections.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {[
          ["Authentication", "Supabase Auth is active for login/session management."],
          ["Workspace Access", "Role-based access should be enforced for team users."],
          ["API Protection", "Service role keys must remain server-side only."],
          ["Audit Trail", "Track important workspace actions and automation events."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-xl border p-6 space-y-2">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
