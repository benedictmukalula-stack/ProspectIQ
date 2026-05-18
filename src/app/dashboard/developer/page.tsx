export default function DeveloperSettingsPage() {
  const envChecks = [
    ["Supabase URL", "NEXT_PUBLIC_SUPABASE_URL"],
    ["Supabase Anon Key", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    ["Stripe Price IDs", "NEXT_PUBLIC_STRIPE_PRO_PRICE_ID / BUSINESS_PRICE_ID"],
    ["Proxycurl", "RAPIDAPI_KEY"],
    ["Email Provider", "RESEND_API_KEY or AWS SES credentials"],
  ]

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Developer Settings</h1>
        <p className="text-sm text-muted-foreground">Environment, API, webhook, and infrastructure readiness checklist.</p>
      </div>

      <section className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Environment Checklist</h2>
        <div className="space-y-3">
          {envChecks.map(([label, key]) => (
            <div key={label} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{key}</p>
              </div>
              <span className="rounded-full border px-3 py-1 text-xs">Verify in Vercel</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
