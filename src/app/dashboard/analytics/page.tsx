import { FeatureGate } from "@/components/features/feature-gate"

export default function AnalyticsPage() {
  return (
    <FeatureGate
      feature="advanced_analytics"
      title="Advanced analytics requires Pro"
      description="Upgrade to Pro or Business to unlock analytics, conversion reporting, and pipeline intelligence."
    >
      <main className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Analyze campaign performance, lead conversion, AI activity, and pipeline metrics.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border p-6">
            <h2 className="text-lg font-semibold">Lead conversion</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Conversion analytics module enabled.
            </p>
          </div>

          <div className="rounded-xl border p-6">
            <h2 className="text-lg font-semibold">Campaign analytics</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Campaign performance tracking enabled.
            </p>
          </div>

          <div className="rounded-xl border p-6">
            <h2 className="text-lg font-semibold">AI usage</h2>
            <p className="text-sm text-muted-foreground mt-2">
              AI activity reporting enabled.
            </p>
          </div>
        </div>
      </main>
    </FeatureGate>
  )
}
