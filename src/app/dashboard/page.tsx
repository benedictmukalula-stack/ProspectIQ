import type { Metadata } from "next";
import { isDemoMode } from "@/lib/env";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export const metadata: Metadata = {
  title: "ProspectIQ - Dashboard",
  description: "Your B2B lead intelligence overview.",
};

/**
 * Dashboard page — renders in ALL cases, never auto-redirects.
 *
 * Demo mode (no Supabase): renders mock data immediately.
 * Supabase mode: renders a client-side session wrapper that either
 * shows the dashboard or a "please sign in" message — NEVER redirects.
 */
export default function DashboardPage() {
  return <DashboardContent />;
}
