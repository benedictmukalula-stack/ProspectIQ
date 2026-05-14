"use client";

import { useState } from "react";
import Link from "next/link";
import { ScrollReveal } from "./scroll-reveal";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    description: "For individuals getting started with outbound prospecting.",
    monthlyPrice: 0,
    annualPrice: 0,
    cta: "Get Started Free",
    href: "/auth/signup",
    highlighted: false,
    features: [
      "100 leads per month",
      "Basic lead search",
      "Manual lead scoring",
      "Email verification",
      "CSV export",
      "1 user seat",
      "Community support",
    ],
  },
  {
    name: "Growth",
    description:
      "For growing teams that need AI-powered prospecting at scale.",
    monthlyPrice: 79,
    annualPrice: 63,
    cta: "Start Free Trial",
    href: "/auth/signup",
    highlighted: true,
    features: [
      "5,000 leads per month",
      "AI-powered lead scoring",
      "Automated email sequences",
      "Intent signal tracking",
      "Data enrichment",
      "Performance analytics",
      "5 user seats",
      "CRM integrations",
      "Priority email support",
    ],
  },
  {
    name: "Enterprise",
    description: "For large organizations with custom requirements.",
    monthlyPrice: null,
    annualPrice: null,
    cta: "Contact Sales",
    href: "/auth/signup",
    highlighted: false,
    features: [
      "Unlimited leads",
      "Custom scoring models",
      "Advanced sequence builder",
      "API access",
      "SSO & SAML",
      "Dedicated CSM",
      "Custom integrations",
      "SLA & uptime guarantee",
      "Audit logs",
      "On-premise deployment option",
    ],
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="relative bg-[#09090b] px-6 py-24 sm:py-32">
      {/* Divider */}
      <div className="absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="animate-reveal-up text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400 sm:text-lg">
            Start free. Scale as you grow. No hidden fees, no surprises.
          </p>
        </ScrollReveal>

        {/* Toggle */}
        <ScrollReveal className="mt-10 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                !annual
                  ? "bg-white/[0.08] text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                annual
                  ? "bg-white/[0.08] text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Annual
              <span className="ml-1.5 text-xs text-emerald-400">Save 20%</span>
            </button>
          </div>
        </ScrollReveal>

        {/* Pricing cards */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <ScrollReveal key={tier.name} className="animate-reveal-up">
              <div
                className={`relative flex h-full flex-col rounded-xl border p-6 sm:p-8 transition-all duration-300 ${
                  tier.highlighted
                    ? "border-emerald-500/30 bg-emerald-500/[0.03] shadow-lg shadow-emerald-500/5"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white">
                    {tier.name}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    {tier.description}
                  </p>
                </div>

                <div className="mb-6">
                  {tier.monthlyPrice !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">
                        ${annual ? tier.annualPrice : tier.monthlyPrice}
                      </span>
                      <span className="text-sm text-zinc-500">/month</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-white">
                        Custom
                      </span>
                    </div>
                  )}
                  {annual && tier.monthlyPrice !== null && tier.monthlyPrice > 0 && (
                    <p className="mt-1 text-xs text-zinc-500">
                      Billed annually (${tier.annualPrice! * 12}/year)
                    </p>
                  )}
                </div>

                <Link
                  href={tier.href}
                  className={`mb-8 block rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-all ${
                    tier.highlighted
                      ? "bg-emerald-500 text-white hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25"
                      : "border border-white/[0.08] bg-white/[0.04] text-white hover:bg-white/[0.08]"
                  }`}
                >
                  {tier.cta}
                </Link>

                <div className="mt-auto space-y-3">
                  {tier.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-2.5"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span className="text-sm text-zinc-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
