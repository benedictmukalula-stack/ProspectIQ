export default function DataPrivacyPage() {
  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Data & Privacy</h1>
        <p className="text-sm text-muted-foreground">Manage export readiness, retention, deletion, and compliance controls.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {[
          ["Lead Data Export", "Prepare CSV exports for leads, contacts, campaigns, and engagement events."],
          ["Retention Policy", "Define how long prospect, enrichment, and activity data is kept."],
          ["Deletion Requests", "Support workspace-level deletion and contact removal workflows."],
          ["Compliance Records", "Track unsubscribe, bounce, consent, and data source metadata."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-xl border p-6 space-y-3">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{body}</p>
            <button className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Open</button>
          </div>
        ))}
      </section>
    </main>
  )
}
