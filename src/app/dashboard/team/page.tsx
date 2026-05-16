import { FeatureGate } from "@/components/features/feature-gate"

export default function TeamPage() {
  return (
    <FeatureGate
      feature="team_management"
      title="Team management requires Business"
      description="Upgrade to Business to invite team members, manage workspace roles, and enable collaboration."
    >
      <main className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Team</h1>
          <p className="text-sm text-muted-foreground">
            Manage workspace users, permissions, and collaboration settings.
          </p>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Workspace members</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Team management infrastructure is enabled.
          </p>
        </div>
      </main>
    </FeatureGate>
  )
}
