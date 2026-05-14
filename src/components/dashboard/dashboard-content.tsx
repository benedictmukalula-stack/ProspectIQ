"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn, AlertCircle } from "lucide-react";
import { isDemoMode, isSupabaseConfigured } from "@/lib/supabase/client";
import { hasDemoSession } from "@/lib/auth/demo-session";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { LeadGrowthChart } from "@/components/dashboard/lead-growth-chart";
import { TopProspectsTable } from "@/components/dashboard/top-prospects-table";
import { ActivityFeedWidget } from "@/components/dashboard/activity-feed";
import { CampaignPreviewCards } from "@/components/dashboard/campaign-preview";
import { TasksPreview } from "@/components/dashboard/tasks-preview";
import { AiInsightsPreview } from "@/components/dashboard/ai-insights";

/**
 * Client-side dashboard content wrapper.
 *
 * Demo mode:
 *   - Always renders the full mock dashboard.
 *   - No session check — demo data is always visible.
 *   - Shows a "Demo mode" banner.
 *
 * Supabase mode:
 *   - Checks for an active Supabase session on mount.
 *   - If session exists → renders the dashboard shell.
 *   - If session missing → shows a sign-in prompt (NEVER auto-redirects).
 */
export function DashboardContent() {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    if (isDemoMode) {
      // Demo mode: always ready, always render
      setHasSession(true);
      setReady(true);
      return;
    }

    // Supabase mode: check session client-side
    checkSupabaseSession();
  }, []);

  async function checkSupabaseSession() {
    try {
      // Dynamic import to avoid bundling Supabase in demo mode
      const { supabaseAuth } = await import("@/lib/supabase/client");
      const result = await supabaseAuth.getSession();
      setHasSession(!!result.data?.session);
    } catch {
      // Supabase unavailable — treat as no session
      setHasSession(false);
    } finally {
      setReady(true);
    }
  }

  // Loading state — brief flash while checking session
  if (!ready) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
      </div>
    );
  }

  // No session in Supabase mode — show sign-in prompt, NO redirect
  if (!hasSession && !isDemoMode) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.04]">
          <LogIn className="h-6 w-6 text-zinc-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-zinc-200">
            Sign in to view your dashboard
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            You need to be signed in to access your B2B lead intelligence data.
          </p>
        </div>
        <Link href="/auth/login">
          <Button className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700">
            <LogIn className="h-4 w-4" />
            Go to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  // Dashboard content (demo mode OR Supabase mode with valid session)
  return (
    <div className="space-y-6">
      {/* Demo mode banner */}
      {isDemoMode && (
        <div className="flex items-center gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
          <span className="text-xs font-semibold text-amber-300">Demo mode</span>
          <span className="text-xs text-amber-200/70">
            — Supabase is not connected. Dashboard is showing mock data.
          </span>
        </div>
      )}

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
