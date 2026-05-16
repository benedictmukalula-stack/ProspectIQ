import Link from "next/link"

export function UpgradeRequired({
  title = "Upgrade required",
  message = "You have reached your current plan limit.",
}: {
  title?: string
  message?: string
}) {
  return (
    <div className="rounded-xl border border-dashed p-6 space-y-3">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>

      <Link
        href="/dashboard/billing"
        className="inline-flex rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90"
      >
        View Upgrade Options
      </Link>
    </div>
  )
}
