import type { Metadata } from "next";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { LeadGrowthChart } from "@/components/dashboard/lead-growth-chart";
import { TopProspectsTable } from "@/components/dashboard/top-prospects-table";
import { ActivityFeedWidget } from "@/components/dashboard/activity-feed";
import { CampaignPreviewCards } from "@/components/dashboard/campaign-preview";
import { TasksPreview } from "@/components/dashboard/tasks-preview";
import { AiInsightsPreview } from "@/components/dashboard/ai-insights";

export const metadata: Metadata = {
  title: "ProspectIQ - Dashboard",
  description: "Your B2B lead intelligence overview.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Overview
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Your lead generation performance at a glance.
        </p>
      </div>

      {/* KPI Cards */}
      <KpiCards />

      {/* Main Grid: Chart + Activity */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <LeadGrowthChart />
        </div>
        <div className="lg:col-span-2">
          <ActivityFeedWidget />
        </div>
      </div>

      {/* Top Prospects Table */}
      <TopProspectsTable />

      {/* Secondary Grid: Campaigns + Tasks + AI Insights */}
      <div className="grid gap-6 lg:grid-cols-3">
        <CampaignPreviewCards />
        <TasksPreview />
        <AiInsightsPreview />
      </div>
    </div>
  );
}
