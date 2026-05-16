export function PlanBadge({
  plan = "free",
  status = "inactive",
}: {
  plan?: string | null
  status?: string | null
}) {
  const label = `${plan || "free"}${status && status !== "active" ? ` · ${status}` : ""}`

  return (
    <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize">
      {label}
    </span>
  )
}
