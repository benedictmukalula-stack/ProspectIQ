export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode
  tone?: "neutral" | "success" | "warning" | "danger"
}) {
  const tones = {
    neutral: "border-slate-300 bg-slate-100 text-slate-700",
    success: "border-emerald-300 bg-emerald-50 text-emerald-700",
    warning: "border-amber-300 bg-amber-50 text-amber-700",
    danger: "border-red-300 bg-red-50 text-red-700",
  }

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}
