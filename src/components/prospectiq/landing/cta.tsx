import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

export function CTA() {
  return (
    <section className="relative bg-[#09090b] px-6 py-24 sm:py-32">
      {/* Divider */}
      <div className="absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="animate-reveal-scale">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 px-6 py-16 text-center shadow-2xl shadow-emerald-500/20 sm:px-16 sm:py-20">
            {/* Decorative elements */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/5 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/5 blur-3xl min-h-[320px] w-full min-w-0" />

            <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Start building your pipeline today
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-emerald-50/80 sm:text-lg">
                Join sales teams who use ProspectIQ to find better leads,
                book more meetings, and close deals faster.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/auth/signup"
                  className="group inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-50 hover:shadow-xl"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center rounded-lg border border-white/25 px-6 py-3 text-sm font-medium text-white transition-all hover:border-white/40 hover:bg-white/10"
                >
                  Sign In
                </Link>
              </div>
              <p className="mt-4 text-sm text-emerald-100/60">
                Free 14-day trial. No credit card required.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
