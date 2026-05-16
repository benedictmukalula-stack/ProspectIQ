export default function BillingPage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Manage your ProspectIQ subscription and plan upgrades.
        </p>
      </div>

      <div className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold">ProspectIQ Pro</h2>
        <p className="mt-2 text-sm text-muted-foreground">$29/month</p>
        <button className="mt-4 rounded-lg bg-black px-4 py-2 text-white">
          Upgrade to Pro
        </button>
      </div>
    </main>
  )
}
