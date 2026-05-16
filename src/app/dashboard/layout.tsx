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
  ["Campaigns", "/dashboard/campaigns"],
  ["Tasks", "/dashboard/tasks"],
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
      <aside className="w-64 border-r bg-black text-white p-6">
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
      </aside>

      <main className="flex-1 p-8 bg-background">
        {children}
      </main>
    </div>
  )
}
