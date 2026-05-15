import Link from "next/link";

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

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex">
        <aside className="hidden min-h-screen w-72 border-r border-white/10 bg-slate-900/60 p-6 lg:block">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold">ProspectIQ</h1>
          </Link>

          <p className="mt-1 text-sm text-slate-400">
            B2B Intelligence Platform
          </p>

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
                <p className="text-sm text-slate-400">Demo Workspace</p>
                <h2 className="text-xl font-semibold">ProspectIQ Control Center</h2>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                Admin: benedict.mukalula@gmail.com
              </div>
            </div>
          </header>

          <div className="p-6 lg:p-8">
            <div className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
              Demo mode: Supabase is not connected. All dashboard data is mock data.
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
