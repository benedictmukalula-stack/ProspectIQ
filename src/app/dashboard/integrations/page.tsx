"use client"

const integrations = [
  {
    name: "Supabase",
    category: "Core Infrastructure",
    description:
      "Authentication, PostgreSQL database, workspace isolation, realtime subscriptions, and storage.",
    status: "Connected",
    readiness: "Production Ready",
    action: "Open Console",
  },
  {
    name: "Stripe",
    category: "Billing",
    description:
      "Subscription billing, checkout sessions, invoice handling, and customer portal management.",
    status: "Setup Required",
    readiness: "Pending",
    action: "Configure Billing",
  },
  {
    name: "Proxycurl",
    category: "Lead Intelligence",
    description:
      "LinkedIn enrichment, profile intelligence, contact enrichment, and company research.",
    status: "Setup Required",
    readiness: "Sandbox",
    action: "Add API Key",
  },
  {
    name: "Resend / SES",
    category: "Outbound Delivery",
    description:
      "Production outbound email delivery provider replacing current mock transport.",
    status: "Mock Mode",
    readiness: "Pending",
    action: "Connect Provider",
  },
  {
    name: "Webhooks",
    category: "Automation",
    description:
      "Receive opens, replies, clicks, bounce events, workflow triggers, and CRM updates.",
    status: "Setup Required",
    readiness: "Pending",
    action: "Configure Endpoints",
  },
  {
    name: "OpenAI / Zhipu",
    category: "AI Providers",
    description:
      "AI reasoning, drafting, lead scoring, campaign recommendations, and copilots.",
    status: "Sandbox",
    readiness: "Ready for Integration",
    action: "Configure Models",
  },
]

export default function IntegrationsPage() {
  return (
    <main className="space-y-8">
      <section className="rounded-2xl border bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
        <p className="text-sm text-slate-300">
          Enterprise Infrastructure
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Integrations & API Control Center
        </h1>

        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Manage infrastructure providers, AI integrations, outbound delivery,
          enrichment services, billing systems, and production readiness.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["Connected Services", "2"],
            ["Pending Integrations", "4"],
            ["AI Providers", "Ready"],
            ["Environment Status", "Sandbox"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-white/5 p-5"
            >
              <p className="text-xs text-slate-300">{label}</p>
              <p className="mt-2 text-3xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {integrations.map((integration) => (
          <article
            key={integration.name}
            className="rounded-2xl border p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border px-2 py-0.5 text-xs">
                    {integration.category}
                  </span>

                  <span className="rounded-full border px-2 py-0.5 text-xs">
                    {integration.readiness}
                  </span>
                </div>

                <h2 className="mt-3 text-xl font-semibold">
                  {integration.name}
                </h2>

                <p className="mt-3 text-sm text-muted-foreground">
                  {integration.description}
                </p>
              </div>

              <div className="rounded-xl border p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Status
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {integration.status}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-lg bg-black px-4 py-2 text-sm text-white">
                {integration.action}
              </button>

              <button className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                View Logs
              </button>

              <button className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                Test Connection
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">
          Production Launch Checklist
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            { label: "Connect production email provider", complete: false },
            { label: "Configure Stripe live billing", complete: false },
            { label: "Enable Supabase RLS policies", complete: false },
            { label: "Connect AI provider keys", complete: false },
            { label: "Configure webhook endpoints", complete: false },
            { label: "Deploy Vercel production environment", complete: true },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-xl border p-4"
            >
              <span className="text-sm">{item.label}</span>

              <span
                className={`rounded-full px-3 py-1 text-xs ${
                  item.complete
                    ? "bg-green-500/10 text-green-600"
                    : "bg-yellow-500/10 text-yellow-700"
                }`}
              >
                {item.complete ? "Complete" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
