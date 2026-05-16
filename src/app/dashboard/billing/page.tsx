"use client";

import { useEffect, useState } from "react";
import { supabaseAuth } from "@/lib/supabase/client";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For testing the ProspectIQ workspace.",
    features: [
      "Manual lead capture",
      "Demo analytics",
      "Basic CRM workspace",
      "LinkedIn research tools",
    ],
    cta: "Current Starter",
    priceId: "",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For operators building real outbound workflows.",
    features: [
      "AI lead scoring",
      "Campaign sequencing",
      "Email queue and sending",
      "Workflow automations",
      "Reporting exports",
    ],
    cta: "Upgrade to Pro",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$79",
    period: "per month",
    description: "For teams and agencies managing multiple campaigns.",
    features: [
      "Team collaboration",
      "Advanced enrichment workflows",
      "High-volume lead research",
      "Priority automation workflows",
      "Commercial outbound operations",
    ],
    cta: "Upgrade to Business",
    priceId: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID || "",
    highlighted: false,
  },
];

export default function BillingPage() {
  const [email, setEmail] = useState("");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabaseAuth.getUser().then((result) => {
      setEmail(result.data.user?.email || "");
    });

    const params = new URLSearchParams(window.location.search);

    if (params.get("success")) {
      setMessage("Checkout completed. Your subscription status will update after Stripe webhook sync is added.");
    }

    if (params.get("cancelled")) {
      setMessage("Checkout cancelled. No subscription changes were made.");
    }
  }, []);

  async function startCheckout(planName: string, priceId: string) {
    if (!priceId) {
      setMessage(`${planName} price ID is not configured yet.`);
      return;
    }

    setLoadingPlan(planName);
    setMessage("");

    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        priceId,
        userEmail: email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Unable to start checkout.");
      setLoadingPlan(null);
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ Billing</p>
        <h1 className="mt-2 text-3xl font-bold">Subscription Billing</h1>
        <p className="mt-2 text-slate-400">
          Upgrade your workspace to unlock commercial AI sales intelligence workflows.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 text-sm text-blue-100">
          {message}
        </div>
      )}

      <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Current Workspace</h2>
            <p className="mt-2 text-sm text-slate-400">
              {email || "Signed-in workspace user"}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
              Current Plan
            </p>
            <p className="mt-2 text-2xl font-bold text-white">Free</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-3xl border p-6 ${
              plan.highlighted
                ? "border-blue-400/40 bg-blue-500/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                <p className="mt-2 text-sm text-slate-400">{plan.description}</p>
              </div>

              {plan.highlighted && (
                <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white">
                  Recommended
                </span>
              )}
            </div>

            <div className="mt-6">
              <span className="text-4xl font-bold text-white">{plan.price}</span>
              <span className="ml-2 text-sm text-slate-400">{plan.period}</span>
            </div>

            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="text-sm text-slate-300">
                  ✓ {feature}
                </li>
              ))}
            </ul>

            <button
              type="button"
              disabled={plan.name === "Free" || loadingPlan === plan.name}
              onClick={() => startCheckout(plan.name, plan.priceId)}
              className={`mt-8 w-full rounded-xl px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                plan.highlighted
                  ? "bg-blue-500 text-white hover:bg-blue-400"
                  : "border border-white/10 text-white hover:bg-white/5"
              }`}
            >
              {loadingPlan === plan.name ? "Starting Checkout..." : plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5 text-sm text-amber-100">
        Stripe checkout is now connected. Webhook-based subscription sync can be added next to automatically update plan status inside Supabase.
      </div>
    </div>
  );
}
