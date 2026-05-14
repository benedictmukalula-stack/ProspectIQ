import {
  Search,
  Target,
  Zap,
  BarChart3,
  Shield,
  Layers,
} from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

const features = [
  {
    icon: Search,
    title: "AI Lead Discovery",
    description:
      "Define your ideal customer profile and let AI scan thousands of sources — company databases, social platforms, news, and job boards — to surface prospects that match.",
  },
  {
    icon: Target,
    title: "Predictive Lead Scoring",
    description:
      "Machine learning models analyze firmographics, technographics, and behavioral signals to rank every lead by likelihood to convert.",
  },
  {
    icon: Zap,
    title: "Automated Outreach",
    description:
      "Build multi-step email sequences that adapt in real-time. Personalize subject lines, timing, and content based on prospect engagement patterns.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description:
      "Track reply rates, open rates, meeting bookings, and pipeline velocity with real-time dashboards and actionable conversion insights.",
  },
  {
    icon: Shield,
    title: "Intent Signal Tracking",
    description:
      "Detect buying intent from content consumption, website visits, and social activity. Reach prospects when they are actively researching solutions.",
  },
  {
    icon: Layers,
    title: "Data Enrichment",
    description:
      "Automatically append verified emails, phone numbers, company details, and tech stack data to every lead profile in your pipeline.",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="relative bg-[#09090b] px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="animate-reveal-up text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Built for modern sales teams
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400 sm:text-lg">
            Everything you need to identify, engage, and convert high-value
            B2B prospects — powered by AI that gets smarter with every
            interaction.
          </p>
        </ScrollReveal>

        <ScrollReveal className="stagger-children mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 transition-colors group-hover:bg-emerald-500/15">
                <feature.icon className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
