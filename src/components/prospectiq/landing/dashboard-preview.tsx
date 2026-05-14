import { ScrollReveal } from "./scroll-reveal";

export function DashboardPreview() {
  return (
    <section className="relative bg-[#09090b] px-6 py-24 sm:py-32">
      {/* Divider */}
      <div className="absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="animate-reveal-up text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
            Dashboard
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            See everything at a glance
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400 sm:text-lg">
            One dashboard for your entire pipeline — from lead discovery
            to conversion metrics. All your data, always up to date.
          </p>
        </ScrollReveal>

        {/* Dashboard Mockup */}
        <ScrollReveal className="animate-reveal-scale mt-16">
          <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c0e] shadow-2xl shadow-black/40">
            {/* Glow effect */}
            <div className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />

            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-white/10" />
              <div className="h-3 w-3 rounded-full bg-white/10" />
              <div className="h-3 w-3 rounded-full bg-white/10" />
              <div className="mx-auto flex items-center gap-2 rounded-md bg-white/[0.04] px-3 py-1">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400/60" />
                <span className="text-[10px] text-zinc-500">
                  app.prospectiq.com/dashboard
                </span>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="flex">
              {/* Sidebar */}
              <div className="hidden w-44 shrink-0 border-r border-white/[0.06] p-4 md:block">
                <div className="mb-6 flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-emerald-500/20" />
                  <div className="h-2.5 w-20 rounded bg-white/[0.08]" />
                </div>
                <div className="space-y-1">
                  {["Dashboard", "Leads", "Sequences", "Analytics", "Settings"].map(
                    (item, i) => (
                      <div
                        key={item}
                        className={`rounded-md px-3 py-2 text-xs ${
                          i === 0
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "text-zinc-500"
                        }`}
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Main area */}
              <div className="flex-1 p-4 sm:p-6">
                {/* Stat row */}
                <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    { label: "Total Leads", value: "2,847" },
                    { label: "Qualified", value: "891" },
                    { label: "Conversion", value: "12.4%" },
                    { label: "Avg. Score", value: "74" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 sm:p-4"
                    >
                      <p className="text-[10px] text-zinc-500">{stat.label}</p>
                      <p className="mt-1 text-lg font-semibold text-white sm:text-xl">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Chart placeholder */}
                <div className="mb-6 rounded-lg border border-white/[0.04] bg-white/[0.02] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs font-medium text-zinc-400">
                      Leads Over Time
                    </p>
                    <div className="flex gap-2">
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
                        Monthly
                      </span>
                      <span className="rounded px-2 py-0.5 text-[10px] text-zinc-500">
                        Weekly
                      </span>
                    </div>
                  </div>
                  {/* Simulated bar chart */}
                  <div className="flex h-24 items-end gap-1.5">
                    {[40, 55, 35, 65, 50, 75, 60, 85, 70, 90, 80, 95].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm bg-emerald-500/20 transition-colors first:bg-emerald-500/40 last:bg-emerald-500/50"
                          style={{ height: `${h}%` }}
                        />
                      )
                    )}
                  </div>
                  <div className="mt-2 flex justify-between text-[9px] text-zinc-600">
                    <span>Jan</span>
                    <span>Mar</span>
                    <span>Jun</span>
                    <span>Sep</span>
                    <span>Dec</span>
                  </div>
                </div>

                {/* Table placeholder */}
                <div className="rounded-lg border border-white/[0.04] bg-white/[0.02]">
                  <div className="border-b border-white/[0.04] px-4 py-3">
                    <p className="text-xs font-medium text-zinc-400">
                      Recent Leads
                    </p>
                  </div>
                  <div className="divide-y divide-white/[0.04]">
                    {[
                      { name: "Sarah Chen", company: "Stripe", score: 92 },
                      { name: "James Wilson", company: "Notion", score: 85 },
                      { name: "Maria Garcia", company: "Linear", score: 78 },
                      { name: "Alex Kim", company: "Vercel", score: 88 },
                    ].map((lead) => (
                      <div
                        key={lead.name}
                        className="flex items-center justify-between px-4 py-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-full bg-white/[0.06]" />
                          <div>
                            <p className="text-xs font-medium text-zinc-300">
                              {lead.name}
                            </p>
                            <p className="text-[10px] text-zinc-600">
                              {lead.company}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            lead.score >= 85
                              ? "text-emerald-400"
                              : "text-zinc-500"
                          }`}
                        >
                          {lead.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
