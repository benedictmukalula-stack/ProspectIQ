export default function UsagePage() {
  const usage = [
    ["AI prompts", "ai_prompts", "Tracks assistant and workflow AI calls"],
    ["Lead enrichments", "lead_enrichments", "Tracks Proxycurl/enrichment usage"],
    ["Exports", "exports", "Tracks CSV/CRM export usage"],
    ["Campaigns", "campaigns", "Tracks campaign creation limits"],
    ["Team members", "team_members", "Tracks workspace seats"],
  ]

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Usage & Limits</h1>
        <p className="text-sm text-muted-foreground">
          Monitor plan limits, AI credits, enrichment usage, exports, campaigns, and team seats.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {usage.map(([name, key, description]) => (
          <div key={key} className="rounded-xl border p-6 space-y-2">
            <h2 className="text-lg font-semibold">{name}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
            <p className="text-xs text-muted-foreground">
              Usage key: <span className="font-mono">{key}</span>
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Plan gates</h2>
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="font-medium">Free</p>
            <p className="text-muted-foreground">Basic testing limits.</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="font-medium">Pro</p>
            <p className="text-muted-foreground">Higher AI, enrichment, campaign, and export limits.</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="font-medium">Business</p>
            <p className="text-muted-foreground">Team, analytics, and enterprise-scale usage limits.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
