"use client";

import { ScrollReveal } from "./scroll-reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

const faqs = [
  {
    question: "What is ProspectIQ?",
    answer:
      "ProspectIQ is a B2B lead intelligence platform that uses AI to discover, score, and engage potential customers. It automates the most time-consuming parts of prospecting — sourcing leads, enriching data, and orchestrating outreach — so your sales team can focus on building relationships and closing deals.",
  },
  {
    question: "How does the AI lead scoring work?",
    answer:
      "Our scoring models analyze multiple data points including firmographics, technographics, engagement behavior, and intent signals. The models are trained on conversion data and continuously improve as more interactions are recorded. You can also customize scoring weights to prioritize the attributes that matter most for your specific ICP.",
  },
  {
    question: "What data sources do you use?",
    answer:
      "We aggregate data from publicly available sources including company websites, professional networks, public filings, tech stack databases, and news sources. All data enrichment goes through verification before being added to a lead profile. We do not scrape private or gated content.",
  },
  {
    question: "Can I integrate ProspectIQ with my existing tools?",
    answer:
      "ProspectIQ offers native integrations with popular CRM platforms and sales tools via direct connectors. Our REST API also allows custom integrations with any system in your tech stack. Data syncs bidirectionally to keep your pipeline current across all tools.",
  },
  {
    question: "Is my data secure?",
    answer:
      "We use industry-standard encryption for data at rest and in transit. Access controls, audit logging, and data retention policies are configurable per workspace. We do not sell or share your data with third parties. Enterprise plans include additional security controls and compliance documentation.",
  },
  {
    question: "How does the free trial work?",
    answer:
      "The 14-day free trial gives you full access to Growth plan features with no credit card required. At the end of the trial, you can choose a paid plan that fits your needs or continue with the free Starter plan. Your data is preserved when you transition between plans.",
  },
  {
    question: "What kind of support do you offer?",
    answer:
      "All plans include email support with response times under 24 hours. Growth plans include priority support with faster response times. Enterprise plans come with a dedicated customer success manager and custom onboarding to help your team get the most out of the platform.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="relative bg-[#09090b] px-6 py-24 sm:py-32">
      {/* Divider */}
      <div className="absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="mx-auto max-w-3xl">
        <ScrollReveal className="animate-reveal-up text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-400">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-zinc-400">
            Common questions about ProspectIQ. Can&apos;t find what you&apos;re
            looking for? Reach out to our team.
          </p>
        </ScrollReveal>

        <ScrollReveal className="animate-reveal-up mt-12">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-white/[0.06]"
              >
                <AccordionTrigger className="text-left text-sm font-medium text-zinc-300 hover:text-white hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-zinc-400">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  );
}
