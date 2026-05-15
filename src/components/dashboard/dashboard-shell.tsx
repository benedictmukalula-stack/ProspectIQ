"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient, isDemoMode, supabaseAuth } from "@/lib/supabase/client";

const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Leads", href: "/dashboard/leads" },
  { label: "Companies", href: "/dashboard/companies" },
  { label: "Pipeline", href: "/dashboard/crm/pipeline" },
  { label: "Tasks", href: "/dashboard/tasks" },
  { label: "Campaigns", href: "/dashboard/campaigns" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "AI Assistant", href: "/dashboard/ai-assistant" },
  { label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState("Guest user");
  const [authStatus, setAuthStatus] = useState(isDemoMode ? "Demo Mode" : "Checking session...");
  const [workspaceName, setWorkspaceName] = useState("Demo Workspace");
  const [userRole, setUserRole] = useState("No role");

  useEffect(() => {
    async function loadProfile() {
      if (isDemoMode) {
        setUserEmail("benedict.mukalula@gmail.com");
        setAuthStatus("Demo Mode");
        setWorkspaceName("Demo Workspace");
        setUserRole("owner");
        return;
      }

      const userResult = await supabaseAuth.getUser();

      if (userResult.error || !userResult.data.user) {
        setAuthStatus("No active session");
        setUserEmail("Guest user");
        setWorkspaceName("No workspace");
        setUserRole("No role");
        return;
      }

      const user = userResult.data.user;
      const email = user.email || "Authenticated user";

      setUserEmail(email);
      setAuthStatus("Authenticated");

      const supabase = createBrowserSupabaseClient();
      if (!supabase) return;

      const workspaceResult = await supabase.rpc("ensure_user_workspace");

      if (workspaceResult.error || !workspaceResult.data?.[0]) {
        setWorkspaceName("Workspace setup failed");
        setUserRole("RPC failed");
        return;
      }

      const workspace = workspaceResult.data[0];

      setWorkspaceName(workspace.organization_name || "ProspectIQ Workspace");
      setUserRole(workspace.user_role || "owner");
    }

    loadProfile();
  }, []);

  async function handleLogout() {
    if (!isDemoMode) await supabaseAuth.signOut();
    window.location.href = "/auth/login";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex">
        <aside className="hidden min-h-screen w-72 border-r border-white/10 bg-slate-900/60 p-6 lg:block">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold">ProspectIQ</h1>
          </Link>

          <p className="mt-1 text-sm text-slate-400">B2B Intelligence Platform</p>

          <nav className="mt-10 space-y-2 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="flex-1">
          <header className="border-b border-white/10 bg-slate-950/80 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-400">{workspaceName}</p>
                <h2 className="text-xl font-semibold">ProspectIQ Control Center</h2>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  <p>{userEmail}</p>
                  <p className="mt-1 text-xs text-slate-500">{authStatus} · {userRole}</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-xl bg-slate-800 px-4 py-3 text-sm text-slate-200 hover:bg-slate-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <div className="p-6 lg:p-8">
            <div className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
              {isDemoMode
                ? "Demo mode: Supabase is not connected. All dashboard data is mock data."
                : "Supabase connected. Profile and workspace are live. Dashboard metrics are still mock data."}
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
