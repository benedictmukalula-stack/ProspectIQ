import Link from "next/link"

const navigation = [
  ["Overview", "/dashboard"],
  ["AI Assistant", "/dashboard/ai-assistant"],
  ["Leads", "/dashboard/leads"],
  ["LinkedIn Research", "/dashboard/linkedin-research"],
  ["Companies", "/dashboard/companies"],
  ["CRM", "/dashboard/crm"],
  ["Pipeline", "/dashboard/pipeline"],
  ["Workflows", "/dashboard/workflows"],
  ["AI Workflows", "/dashboard/ai-workflows"],
  ["Email Automation", "/dashboard/email-automation"],
  ["Outbound", "/dashboard/outbound"],
  ["Sequences", "/dashboard/sequences"],
  ["Send Queue", "/dashboard/send-queue"],
  ["Engagement", "/dashboard/engagement"],
  ["Campaigns", "/dashboard/campaigns"],
  ["Tasks", "/dashboard/tasks"],
  ["Activity", "/dashboard/activity"],
  ["Notifications", "/dashboard/notifications"],
  ["Reports", "/dashboard/reports"],
  ["Analytics", "/dashboard/analytics"],
  ["Team", "/dashboard/team"],
  ["Billing", "/dashboard/billing"],
  ["Usage", "/dashboard/usage"],
  ["Usage Demo", "/dashboard/usage-demo"],
  ["Settings", "/dashboard/settings"],
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col border-r bg-black p-6 text-white">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">ProspectIQ</h1>
          <p className="text-sm text-zinc-400">
            AI Sales Intelligence Platform
          </p>
        </div>

        <nav className="space-y-2">
          {navigation.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="block rounded-lg px-3 py-2 text-sm hover:bg-zinc-800"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-zinc-800 pt-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
                BM
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  Benedict Mukalula
                </p>
                <p className="truncate text-xs text-zinc-400">
                  benedict.mukalula@gmail.com
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-zinc-800 bg-black p-2">
                <p className="text-zinc-500">Plan</p>
                <p className="font-semibold text-emerald-400">Business</p>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-black p-2">
                <p className="text-zinc-500">Status</p>
                <p className="font-semibold text-white">Active</p>
              </div>
            </div>
          </div>
        </div>

      </aside>

      <main className="flex-1 p-8 bg-background">
        {children}
      </main>
    </div>
  )
}
