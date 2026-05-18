"use client"

const envChecks = [
  {
    label: "Supabase URL",
    key: "NEXT_PUBLIC_SUPABASE_URL",
    status: "Configured",
  },
  {
    label: "Supabase Anon Key",
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    status: "Configured",
  },
  {
    label: "Stripe Price IDs",
    key: "NEXT_PUBLIC_STRIPE_*",
    status: "Pending",
  },
  {
    label: "Proxycurl / RapidAPI",
    key: "RAPIDAPI_KEY",
    status: "Pending",
  },
  {
    label: "Email Provider",
    key: "RESEND_API_KEY / AWS SES",
    status: "Mock Mode",
  },
  {
    label: "AI Provider",
    key: "OPENAI_API_KEY / ZHIPU_API_KEY",
    status: "Pending",
  },
]

const webhooks = [
  "email.opened",
  "email.clicked",
  "email.replied",
  "email.bounced",
  "workflow.completed",
  "lead.created",
]

export default function DeveloperSettingsPage() {
  return (
    <main className="space-y-8">
      <section className="rounded-2xl border bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
        <p className="text-sm text-slate-300">
          Engineering Console
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Developer & API Control Center
        </h1>

        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Monitor environment readiness, webhooks, infrastructure health,
          API integrations, and enterprise deployment status.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["Environment", "Sandbox"],
            ["API Readiness", "72%"],
            ["Webhook Events", "6"],
            ["Infrastructure", "Operational"],
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

      <section className="rounded-2xl border p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              Environment Diagnostics
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Verify infrastructure configuration and deployment readiness.
            </p>
          </div>

          <button className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
            Run Diagnostics
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {envChecks.map((check) => (
            <div
              key={check.label}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"
            >
              <div>
                <p className="font-medium">{check.label}</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {check.key}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full border px-3 py-1 text-xs">
                  {check.status}
                </span>

                <button className="rounded-lg border px-3 py-1 text-xs hover:bg-muted">
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">
            Webhook Infrastructure
          </h2>

          <div className="mt-5 space-y-3">
            {webhooks.map((event) => (
              <div
                key={event}
                className="flex items-center justify-between rounded-xl border p-4"
              >
                <div>
                  <p className="font-medium">{event}</p>

                  <p className="text-xs text-muted-foreground">
                    Event subscription endpoint
                  </p>
                </div>

                <span className="rounded-full border px-3 py-1 text-xs">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">
            API & Security Readiness
          </h2>

          <div className="mt-5 space-y-4">
            {[
              [
                "Workspace isolation",
                "Enable strict Supabase RLS policies before production launch.",
              ],
              [
                "API key masking",
                "Never expose service-role keys in frontend runtime.",
              ],
              [
                "Outbound protection",
                "Implement provider rate limits and bounce suppression.",
              ],
              [
                "Webhook validation",
                "Verify provider signatures before processing events.",
              ],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-xl border bg-muted/40 p-4"
              >
                <p className="font-medium">{title}</p>

                <p className="mt-2 text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
