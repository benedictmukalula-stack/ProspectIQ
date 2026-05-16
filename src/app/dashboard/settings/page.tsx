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
        <div className="rounded-xl border p-6 space-y-2">
          <h2 className="text-lg font-semibold">Account</h2>
          <p className="text-sm text-muted-foreground">
            Update your profile, login email, password, and personal preferences.
          </p>
          <button className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
            Manage Account
          </button>
        </div>

        <div className="rounded-xl border p-6 space-y-2">
          <h2 className="text-lg font-semibold">Workspace</h2>
          <p className="text-sm text-muted-foreground">
            Configure workspace name, company details, ownership, and default settings.
          </p>
          <button className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
            Workspace Settings
          </button>
        </div>

        <div className="rounded-xl border p-6 space-y-2">
          <h2 className="text-lg font-semibold">Billing</h2>
          <p className="text-sm text-muted-foreground">
            View your current plan, upgrade, manage invoices, and update payment methods.
          </p>
          <a
            href="/dashboard/billing"
            className="inline-flex rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90"
          >
            Open Billing
          </a>
        </div>

        <div className="rounded-xl border p-6 space-y-2">
          <h2 className="text-lg font-semibold">Integrations</h2>
          <p className="text-sm text-muted-foreground">
            Connect Supabase, Stripe, Proxycurl, email providers, CRM tools, and automation services.
          </p>
          <button className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
            Manage Integrations
          </button>
        </div>

        <div className="rounded-xl border p-6 space-y-2">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Control alerts for leads, campaigns, billing events, workflow failures, and team updates.
          </p>
          <button className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
            Notification Preferences
          </button>
        </div>

        <div className="rounded-xl border p-6 space-y-2">
          <h2 className="text-lg font-semibold">Security</h2>
          <p className="text-sm text-muted-foreground">
            Review sessions, access controls, authentication methods, and workspace permissions.
          </p>
          <button className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
            Security Settings
          </button>
        </div>

        <div className="rounded-xl border p-6 space-y-2">
          <h2 className="text-lg font-semibold">Team Access</h2>
          <p className="text-sm text-muted-foreground">
            Invite users, assign roles, manage seats, and control workspace-level permissions.
          </p>
          <a
            href="/dashboard/team"
            className="inline-flex rounded-lg border px-4 py-2 text-sm hover:bg-muted"
          >
            Manage Team
          </a>
        </div>

        <div className="rounded-xl border p-6 space-y-2">
          <h2 className="text-lg font-semibold">Developer</h2>
          <p className="text-sm text-muted-foreground">
            Manage API keys, webhook endpoints, environment health, and automation logs.
          </p>
          <button className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
            Developer Settings
          </button>
        </div>

        <div className="rounded-xl border p-6 space-y-2">
          <h2 className="text-lg font-semibold">Data & Privacy</h2>
          <p className="text-sm text-muted-foreground">
            Manage data retention, exports, lead privacy, compliance records, and deletion requests.
          </p>
          <button className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
            Data Controls
          </button>
        </div>
      </section>
    </main>
  )
}
