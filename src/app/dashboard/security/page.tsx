const securityControls = [
  {
    title: "Authentication",
    status: "Active",
    description: "Supabase Auth is active for account login and session management.",
  },
  {
    title: "Workspace Isolation",
    status: "Needs RLS Review",
    description: "Enable strict Supabase Row Level Security policies before production launch.",
  },
  {
    title: "API Key Protection",
    status: "Server-only Required",
    description: "Service role keys and provider secrets must never be exposed in browser runtime.",
  },
  {
    title: "Webhook Verification",
    status: "Pending",
    description: "Provider webhook signatures should be validated before processing events.",
  },
  {
    title: "Team Permissions",
    status: "In Progress",
    description: "Role-based access should govern billing, users, exports, and integrations.",
  },
  {
    title: "Audit Logging",
    status: "Recommended",
    description: "Track key events such as invites, exports, campaign sends, and settings changes.",
  },
]

const riskItems = [
  ["High", "Enable RLS for all workspace-scoped tables."],
  ["High", "Move all production provider secrets to server-only environment variables."],
  ["Medium", "Add webhook signature validation for email and billing providers."],
  ["Medium", "Add invite acceptance flow and role enforcement."],
  ["Low", "Add export audit logs for compliance visibility."],
]

export default function SecurityPage() {
  return (
    <main className="space-y-8">
      <section className="rounded-2xl border bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
        <p className="text-sm text-slate-300">Enterprise Security</p>
        <h1 className="mt-2 text-3xl font-bold">Security & Access Center</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Review authentication, workspace isolation, API security, team permissions, webhooks, and production readiness.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["Security Score", "72%"],
            ["Critical Items", "2"],
            ["Controls", securityControls.length],
            ["Environment", "Sandbox"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs text-slate-300">{label}</p>
              <p className="mt-2 text-3xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {securityControls.map((control) => (
          <article key={control.title} className="rounded-2xl border p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold">{control.title}</h2>
              <span className="rounded-full border px-2 py-0.5 text-xs">{control.status}</span>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">{control.description}</p>

            <button className="mt-5 rounded-lg border px-4 py-2 text-sm hover:bg-muted">
              Review Control
            </button>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Risk Register</h2>

          <div className="mt-5 space-y-3">
            {riskItems.map(([severity, item]) => (
              <div key={item} className="flex items-start justify-between gap-4 rounded-xl border p-4">
                <p className="text-sm">{item}</p>
                <span className="rounded-full border px-3 py-1 text-xs">{severity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Production Security Checklist</h2>

          <div className="mt-5 space-y-4">
            {[
              ["Supabase RLS enabled", false],
              ["Service keys server-only", true],
              ["Webhook signatures verified", false],
              ["Team roles enforced", false],
              ["Export logs enabled", false],
              ["Billing webhooks secured", false],
            ].map(([label, done]) => (
              <div key={String(label)} className="flex items-center justify-between rounded-xl border p-4">
                <span className="text-sm">{label}</span>
                <span className={`rounded-full px-3 py-1 text-xs ${done ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-700"}`}>
                  {done ? "Complete" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
