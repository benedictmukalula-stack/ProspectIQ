"use client";

import Link from "next/link";

const platformStats = [
  {
    label: "AI Workflows",
    value: "12",
    description: "Automated lead qualification and follow-up systems",
  },
  {
    label: "CRM Modules",
    value: "9",
    description: "Pipeline, enrichment, outreach, analytics and reporting",
  },
  {
    label: "LLM Engine",
    value: "Live",
    description: "Workspace-aware OpenAI/Zhipu reasoning backend",
  },
  {
    label: "Automation",
    value: "Active",
    description: "Workflow engine with intelligent task execution",
  },
];

const modules = [
  {
    title: "AI Assistant",
    href: "/dashboard/ai-assistant",
    description:
      "Workspace-aware AI sales intelligence assistant with live LLM reasoning.",
  },
  {
    title: "Leads",
    href: "/dashboard/leads",
    description:
      "AI-scored lead management with editing, enrichment and CRM intelligence.",
  },
  {
    title: "CRM Pipeline",
    href: "/dashboard/crm/pipeline",
    description:
      "Drag-and-drop sales pipeline with workflow automation support.",
  },
  {
    title: "Campaign Sequencing",
    href: "/dashboard/campaigns",
    description:
      "Multi-step outbound campaign builder and automation sequencing.",
  },
  {
    title: "Email Automation",
    href: "/dashboard/email",
    description:
      "Resend-powered email queue system and automated outreach engine.",
  },
  {
    title: "Company Enrichment",
    href: "/dashboard/companies",
    description:
      "External enrichment architecture for company intelligence and research.",
  },
  {
    title: "LinkedIn Research",
    href: "/dashboard/linkedin",
    description:
      "Compliant LinkedIn lead discovery and public profile intelligence.",
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    description:
      "Live analytics dashboards powered by Supabase lead intelligence.",
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    description:
      "CSV exports, performance reporting and outbound intelligence summaries.",
  },
  {
    title: "Notifications",
    href: "/dashboard/notifications",
    description:
      "Centralized alerts, sales triggers and workflow notifications.",
  },
  {
    title: "Tasks & Activity",
    href: "/dashboard/tasks",
    description:
      "Task management, sales timelines and activity tracking workspace.",
  },
  {
    title: "Workflow Automation",
    href: "/dashboard/workflows",
    description:
      "Automated sales workflows, lead triggers and AI-driven execution.",
  },
  {
    title: "Team Collaboration",
    href: "/dashboard/team",
    description:
      "Multi-user collaboration, workspace management and sales coordination.",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
        <div className="p-8 lg:p-12">
          <div className="max-w-4xl">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">
              ProspectIQ Intelligence Platform
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white lg:text-6xl">
              AI-Native Sales Intelligence Operating System
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              ProspectIQ now combines AI reasoning, CRM intelligence, workflow
              automation, campaign sequencing, enrichment APIs, LinkedIn
              research, reporting and outbound execution into a unified
              enterprise sales platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard/ai-assistant"
                className="rounded-2xl bg-blue-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-400"
              >
                Open AI Assistant
              </Link>

              <Link
                href="/dashboard/workflows"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Launch Automations
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {platformStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <p className="text-sm text-slate-400">{stat.label}</p>

            <p className="mt-4 text-4xl font-bold text-white">
              {stat.value}
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {stat.description}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Platform Status
            </h2>

            <p className="mt-2 text-slate-300">
              Production-ready AI sales intelligence architecture with live
              OpenAI/Zhipu support, Supabase backend, workflow automations and
              outbound campaign infrastructure.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-black/20 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
              Current Stage
            </p>

            <p className="mt-2 text-2xl font-bold text-white">
              Commercial MVP+
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Platform Modules
            </p>

            <h2 className="mt-2 text-3xl font-bold text-white">
              Operational Intelligence Stack
            </h2>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            {modules.length} Active Modules
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <Link
              key={module.title}
              href={module.href}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-blue-400/40 hover:bg-blue-500/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-white transition group-hover:text-blue-300">
                    {module.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    {module.description}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-300">
                  Live
                </div>
              </div>

              <div className="mt-6 flex items-center text-sm font-medium text-blue-300">
                Open Module
                <span className="ml-2 transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
