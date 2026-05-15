const integrations = [
  {
    name: "Supabase",
    status: "Not Connected",
    description: "Database and authentication provider.",
  },
  {
    name: "OpenAI / Zhipu",
    status: "Coming Soon",
    description: "AI generation and assistant workflows.",
  },
  {
    name: "SMTP Email",
    status: "Coming Soon",
    description: "Outbound campaign email delivery.",
  },
  {
    name: "LinkedIn Automation",
    status: "Coming Soon",
    description: "Lead enrichment and outreach workflows.",
  },
];

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ Workspace</p>

        <h1 className="mt-2 text-3xl font-bold">Settings</h1>

        <p className="mt-2 text-slate-400">
          Workspace configuration and platform integrations.
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Workspace</h2>

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Workspace Name
              </label>

              <input
                defaultValue="Knowledge Camp Global"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Admin Email
              </label>

              <input
                defaultValue="benedict.mukalula@gmail.com"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Default Region
              </label>

              <select className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none">
                <option>Africa</option>
                <option>Europe</option>
                <option>North America</option>
                <option>Asia</option>
              </select>
            </div>

            <button className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-medium text-white">
              Save Settings — Coming Soon
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Integrations</h2>

          <div className="mt-6 space-y-4">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="rounded-xl border border-white/10 bg-slate-900/80 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-white">
                      {integration.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      {integration.description}
                    </p>
                  </div>

                  <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-300">
                    {integration.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold">Environment Status</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">Authentication</p>
            <h3 className="mt-3 text-xl font-semibold text-amber-300">
              Demo Mode
            </h3>
          </div>

          <div className="rounded-xl bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">Database</p>
            <h3 className="mt-3 text-xl font-semibold text-amber-300">
              Not Connected
            </h3>
          </div>

          <div className="rounded-xl bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">AI Engine</p>
            <h3 className="mt-3 text-xl font-semibold text-blue-300">
              UI Ready
            </h3>
          </div>
        </div>
      </section>
    </div>
  );
}
