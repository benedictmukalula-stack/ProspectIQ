import { ScrollReveal } from "./scroll-reveal";

const steps = [
  {
    number: "01",
    title: "Define Your ICP",
    description:
      "Tell us your ideal customer — industry, company size, technologies, and buying signals. Our AI builds a dynamic prospect model that evolves with your market.",
  },
  {
    number: "02",
    title: "Discover & Enrich",
    description:
      "ProspectIQ continuously scans data sources and enriches every lead with verified contact details, firmographics, and intent signals — so you never chase stale data.",
  },
  {
    number: "03",
    title: "Score & Prioritize",
    description:
      "Predictive models rank leads by conversion probability. Focus your team's effort on high-value prospects instead of manually sifting through cold lists.",
  },
  {
    number: "04",
    title: "Engage & Convert",
    description:
      "Launch personalized multi-channel outreach sequences. Track engagement in real time, optimize messaging, and book more qualified meetings on autopilot.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative bg-[#09090b] px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="animate-reveal-up text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
            How It Works
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            From profile to pipeline in four steps
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400 sm:text-lg">
            A streamlined workflow that takes you from defining your target
            audience to booking qualified meetings — with AI handling the heavy
            lifting.
          </p>
        </ScrollReveal>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <ScrollReveal
              key={step.number}
              className="animate-reveal-up"
            >
              <div className="relative">
                {/* Connector line */}
                {index < 3 && (
                  <div className="absolute left-6 top-10 hidden h-px w-[calc(100%-3rem)] bg-gradient-to-r from-white/[0.12] to-white/[0.04] lg:block" />
                )}

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]">
                  <span className="mb-4 inline-block font-mono text-sm font-bold text-emerald-400">
                    {step.number}
                  </span>
                  <h3 className="mb-2 text-base font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    {step.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
