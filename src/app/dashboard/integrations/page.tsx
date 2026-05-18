const integrations = [
  ["Supabase", "Database, authentication, RLS, and workspace data.", "Connected"],
  ["Stripe", "Billing checkout, subscriptions, invoices, and customer portal.", "Setup required"],
  ["Proxycurl", "LinkedIn enrichment and profile intelligence.", "Setup required"],
  ["Email Provider", "Outbound delivery through Resend, SES, or SMTP.", "Mock mode"],
  ["Webhooks", "Receive provider events for opens, clicks, bounces, replies.", "Setup required"],
]

export default function IntegrationsPage() {
  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Integrations</h1>
        <p className="text-sm text-muted-foreground">Connect and monitor external services powering ProspectIQ.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {integrations.map(([name, description, status]) => (
          <div key={name} className="rounded-xl border p-6 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">{name}</h2>
              <span className="rounded-full border px-3 py-1 text-xs">{status}</span>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
            <button className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Configure</button>
          </div>
        ))}
      </section>
    </main>
  )
}
