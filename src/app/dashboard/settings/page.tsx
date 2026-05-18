const settingsSections = [
  {
    title: "Account",
    description: "Update your profile, login email, password, and personal preferences.",
    href: "/dashboard/profile",
    action: "Manage Account",
  },
  {
    title: "Workspace",
    description: "Configure workspace name, company details, ownership, and default settings.",
    href: "/dashboard/workspace",
    action: "Workspace Settings",
  },
  {
    title: "Billing",
    description: "View your current plan, upgrade, manage invoices, and update payment methods.",
    href: "/dashboard/billing",
    action: "Open Billing",
    primary: true,
  },
  {
    title: "Integrations",
    description: "Connect Supabase, Stripe, Proxycurl, email providers, CRM tools, and automation services.",
    href: "/dashboard/integrations",
    action: "Manage Integrations",
  },
  {
    title: "Notifications",
    description: "Control alerts for leads, campaigns, billing events, workflow failures, and team updates.",
    href: "/dashboard/notifications",
    action: "Notification Preferences",
  },
  {
    title: "Security",
    description: "Review sessions, access controls, authentication methods, and workspace permissions.",
    href: "/dashboard/security",
    action: "Security Settings",
  },
  {
    title: "Team Access",
    description: "Invite users, assign roles, manage seats, and control workspace-level permissions.",
    href: "/dashboard/team",
    action: "Manage Team",
  },
  {
    title: "Developer",
    description: "Manage API keys, webhook endpoints, environment health, and automation logs.",
    href: "/dashboard/developer",
    action: "Developer Settings",
  },
  {
    title: "Data & Privacy",
    description: "Manage data retention, exports, lead privacy, compliance records, and deletion requests.",
    href: "/dashboard/data-privacy",
    action: "Data Controls",
  },
]

export default function SettingsPage() {
  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your workspace, account, integrations, billing preferences, and security.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {settingsSections.map((section) => (
          <div key={section.title} className="rounded-xl border p-6 space-y-2">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <p className="text-sm text-muted-foreground">{section.description}</p>
            <a
              href={section.href}
              className={
                section.primary
                  ? "inline-flex rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90"
                  : "inline-flex rounded-lg border px-4 py-2 text-sm hover:bg-muted"
              }
            >
              {section.action}
            </a>
          </div>
        ))}
      </section>
    </main>
  )
}
