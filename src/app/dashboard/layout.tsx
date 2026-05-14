"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProspectIQLogo } from "@/components/prospectiq/logo";
import {
  LayoutDashboard,
  Users,
  Building2,
  Megaphone,
  Contact,
  BarChart3,
  Sparkles,
  CheckSquare,
  UsersRound,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const sidebarItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, active: true },
  { label: "Leads", href: "/dashboard", icon: Users, active: false },
  { label: "Companies", href: "/dashboard", icon: Building2, active: false },
  { label: "Campaigns", href: "/dashboard", icon: Megaphone, active: false },
  { label: "CRM", href: "/dashboard", icon: Contact, active: false },
  { label: "Analytics", href: "/dashboard", icon: BarChart3, active: false },
  { label: "AI Assistant", href: "/dashboard", icon: Sparkles, active: false },
  { label: "Tasks", href: "/dashboard", icon: CheckSquare, active: false },
  { label: "Team", href: "/dashboard", icon: UsersRound, active: false },
  { label: "Settings", href: "/dashboard", icon: Settings, active: false },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0c0c0e]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0a0b] lg:flex">
        <div className="flex h-14 items-center border-b border-white/[0.06] px-4">
          <Link href="/">
            <ProspectIQLogo variant="light" />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <div className="space-y-0.5">
            {sidebarItems.map((item) => {
              const isActive = item.active;
              return isActive ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300"
                  title={`${item.label} — Coming soon`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  <span className="ml-auto rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-zinc-600">
                    Soon
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-white/[0.06] p-3">
          <Link
            href="/auth/login"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? "block" : "hidden"}`}
      >
        <div
          className="absolute inset-0 bg-black/60"
          onClick={() => setMobileOpen(false)}
        />
        <aside className="relative flex h-full w-64 flex-col bg-[#0a0a0b]">
          <div className="flex h-14 items-center justify-between border-b border-white/[0.06] px-4">
            <Link href="/" onClick={() => setMobileOpen(false)}>
              <ProspectIQLogo variant="light" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-1.5 text-zinc-400 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-3">
            <div className="space-y-0.5">
              {sidebarItems.map((item) => {
                const isActive = item.active;
                return isActive ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.label}
                    type="button"
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    <span className="ml-auto rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-zinc-600">
                      Soon
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-white/[0.06] p-3">
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-500 hover:text-zinc-300"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Link>
          </div>
        </aside>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0a0a0b] px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.04] hover:text-white lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-zinc-500">Dashboard</span>
              <ChevronRight className="h-3 w-3 text-zinc-700" />
              <span className="text-zinc-200">Overview</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
              <input
                type="text"
                placeholder="Search leads, companies..."
                className="h-8 w-56 rounded-lg border border-white/[0.06] bg-white/[0.03] pl-8 pr-3 text-xs text-zinc-300 placeholder-zinc-600 outline-none transition-colors focus:border-white/[0.12] focus:bg-white/[0.05] lg:w-72"
              />
            </div>

            {/* Org placeholder */}
            <button
              type="button"
              className="hidden items-center gap-2 rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-white/[0.12] hover:text-zinc-200 md:flex"
            >
              <div className="h-4 w-4 rounded bg-emerald-500/20" />
              <span>Acme Corp</span>
            </button>

            {/* Notifications */}
            <button
              type="button"
              className="relative rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </button>

            {/* User menu placeholder */}
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-white/[0.04]"
              aria-label="User menu"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-semibold text-emerald-400">
                JD
              </div>
              <span className="hidden text-xs font-medium text-zinc-300 sm:block">
                John
              </span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
