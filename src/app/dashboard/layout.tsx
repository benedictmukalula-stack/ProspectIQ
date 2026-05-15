"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { supabaseAuth } from "@/lib/supabase/client";

const navItems = [
  ["Overview", "/dashboard"],
  ["AI Assistant", "/dashboard/ai-assistant"],
  ["Leads", "/dashboard/leads"],
  ["LinkedIn Research", "/dashboard/linkedin"],
  ["Companies", "/dashboard/companies"],
  ["Pipeline", "/dashboard/crm/pipeline"],
  ["Workflows", "/dashboard/workflows"],
  ["Email Automation", "/dashboard/email"],
  ["Campaigns", "/dashboard/campaigns"],
  ["Tasks", "/dashboard/tasks"],
  ["Notifications", "/dashboard/notifications"],
  ["Reports", "/dashboard/reports"],
  ["Analytics", "/dashboard/analytics"],
  ["Team", "/dashboard/team"],
  ["Settings", "/dashboard/settings"],
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabaseAuth.getUser().then((result) => {
      setEmail(result.data.user?.email || "Workspace user");
    });
  }, []);

  async function logout() {
    await supabaseAuth.signOut();
    router.push("/auth/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[290px_1fr]">
        <aside className="border-r border-white/10 bg-slate-950 p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">ProspectIQ</h1>
            <p className="mt-1 text-sm text-slate-400">
              AI Sales Intelligence Platform
            </p>
          </div>

          <nav className="space-y-1">
            {navItems.map(([label, href]) => {
              const active = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  className={`block rounded-xl px-4 py-3 text-sm transition ${
                    active
                      ? "bg-blue-500 text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Workspace
            </p>
            <p className="mt-2 break-all text-sm text-slate-300">{email}</p>
            <p className="mt-2 text-xs text-emerald-300">
              Authenticated · owner
            </p>

            <button
              onClick={logout}
              className="mt-4 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
