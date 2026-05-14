import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-6 pt-16">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 landing-glow" />
      <div className="pointer-events-none absolute inset-0 landing-grid" />

      {/* Decorative orbs */}
      <div
        className="pointer-events-none absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-emerald-500/5 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-1/4 bottom-1/3 h-96 w-96 rounded-full bg-emerald-600/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ animation: "pulse-glow 2s ease-in-out infinite" }} />
          <span className="text-xs font-medium text-emerald-400">
            AI-Powered B2B Lead Intelligence &amp; Outreach
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          Find, qualify, and close{" "}
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
            your ideal B2B prospects
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg md:text-xl">
          ProspectIQ uses machine learning to discover high-intent buyers, score
          leads automatically, and orchestrate personalized outreach — so your
          sales team spends time on conversations that close.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/auth/signup"
            className="group inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-500/25"
          >
            Start Free Trial
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <Play className="h-4 w-4" />
            See How It Works
          </a>
        </div>

        {/* Subtext */}
        <p className="mt-6 text-sm text-zinc-500">
          Free 14-day trial. No credit card required.
        </p>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#09090b] to-transparent" aria-hidden="true" />
    </section>
  );
}
