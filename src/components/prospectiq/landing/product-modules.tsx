import {
  Search,
  Target,
  Mail,
  BarChart3,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";
import { QUEUE_STATUS } from "@/lib/queue/status";

export function ProductModules() {
  return (
    <section
      id="product"
      className="relative bg-[#09090b] px-6 py-24 sm:py-32"
    >
      {/* Section divider */}
      <div className="absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="animate-reveal-up text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
            Product
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            One platform, every pipeline stage
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400 sm:text-lg">
            From first discovery to booked meeting — ProspectIQ handles the
            entire prospecting workflow in a unified workspace.
          </p>
        </ScrollReveal>

        {/* Bento Grid */}
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {/* Lead Discovery — spans 2 cols */}
          <ScrollReveal className="animate-reveal-up md:col-span-2">
            <div className="group h-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04] sm:p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Search className="h-4 w-4 text-emerald-400" />
                </div>
                <h3 className="text-base font-semibold text-white">
                  Lead Discovery
                </h3>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-zinc-400">
                Set your ideal customer profile once. AI continuously scans
                company databases, professional networks, and public filings to
                surface matching prospects — updated daily.
              </p>
              {/* Mini UI mockup */}
              <div className="rounded-lg border border-white/[0.06] bg-[#0c0c0e] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-white/10" />
                  <div className="h-2 w-24 rounded bg-white/[0.06]" />
                  <div className="ml-auto h-2 w-16 rounded bg-emerald-500/20" />
                </div>
                <div className="space-y-2">
                  {[
                    { company: "TechFlow Inc.", match: "94%" },
                    { company: "DataBridge", match: "91%" },
                    { company: "CloudSync", match: "87%" },
                  ].map((item) => (
                    <div
                      key={item.company}
                      className="flex items-center justify-between rounded-md bg-white/[0.03] px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-white/[0.06]" />
                        <span className="text-xs text-zinc-300">
                          {item.company}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-emerald-400">
                        {item.match} match
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Quick Stats — 1 col */}
          <ScrollReveal className="animate-reveal-up" style={{ transitionDelay: "100ms" }}>
            <div className="group flex h-full flex-col rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04] sm:p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>
                <h3 className="text-base font-semibold text-white">
                  Pipeline Metrics
                </h3>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-zinc-400">
                Real-time metrics across your entire pipeline. Monitor conversion
                rates, engagement scores, and outbound performance.
              </p>
              {/* Mini stat cards */}
              <div className="mt-auto space-y-3">
                {[
                  { label: "New Leads", value: "2,847", change: "+18%" },
                  { label: "Contacted", value: "1,204", change: "+12%" },
                  { label: "Meetings", value: "186", change: "+24%" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2.5"
                  >
                    <span className="text-xs text-zinc-400">{stat.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {stat.value}
                      </span>
                      <span className="text-xs text-emerald-400">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Lead Scoring — 1 col */}
          <ScrollReveal className="animate-reveal-up" style={{ transitionDelay: "50ms" }}>
            <div className="group flex h-full flex-col rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04] sm:p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Target className="h-4 w-4 text-emerald-400" />
                </div>
                <h3 className="text-base font-semibold text-white">
                  Lead Scoring
                </h3>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-zinc-400">
                ML models rank every lead by conversion probability using
                firmographics, behavior, and engagement data.
              </p>
              {/* Score bars */}
              <div className="mt-auto space-y-3">
                {[
                  { name: "Sarah Chen", score: 92 },
                  { name: "James Wilson", score: 85 },
                  { name: "Alex Kim", score: 78 },
                ].map((item) => (
                  <div key={item.name}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-zinc-400">
                        {item.name}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          item.score >= 85 ? "text-emerald-400" : "text-zinc-500"
                        }`}
                      >
                        {item.score}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-emerald-500/70 transition-all duration-500"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Email Outreach — spans 2 cols */}
          <ScrollReveal className="animate-reveal-up md:col-span-2">
            <div className="group h-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04] sm:p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Mail className="h-4 w-4 text-emerald-400" />
                </div>
                <h3 className="text-base font-semibold text-white">
                  Email Sequences
                </h3>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-zinc-400">
                Design multi-step outreach campaigns with conditional branching.
                Each email adapts based on whether the prospect opens, clicks,
                or replies — keeping every touchpoint relevant.
              </p>
              {/* Mini sequence mockup */}
              <div className="flex flex-wrap items-center gap-3">
                {[
                  { step: 1, label: "Introduction", status: QUEUE_STATUS.SENT },
                  { step: 2, label: "Value Prop", status: QUEUE_STATUS.SENT },
                  { step: 3, label: "Case Study", status: QUEUE_STATUS.PENDING },
                  { step: 4, label: "Follow-up", status: QUEUE_STATUS.PENDING },
                ].map((item, i) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                        item.status === QUEUE_STATUS.SENT
                          ? "border-emerald-500/30 bg-emerald-500/10"
                          : "border-white/[0.06] bg-white/[0.03]"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${
                          item.status === QUEUE_STATUS.SENT
                            ? "bg-emerald-500 text-white"
                            : "bg-white/[0.06] text-zinc-500"
                        }`}
                      >
                        {item.step}
                      </span>
                      <span
                        className={`text-xs ${
                          item.status === QUEUE_STATUS.SENT
                            ? "text-emerald-300"
                            : "text-zinc-500"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    {i < 3 && (
                      <ArrowRight className="h-3 w-3 text-zinc-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Bottom divider */}
      <div className="absolute left-1/2 bottom-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </section>
  );
}