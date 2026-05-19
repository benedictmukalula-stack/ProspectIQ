export function EnterpriseCard({
  title,
  value,
  description,
  children,
}: {
  title: string
  value?: string | number
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border bg-gradient-to-br from-white to-muted/30 p-6 shadow-sm">
      <p className="text-sm text-muted-foreground">{title}</p>

      {value !== undefined && (
        <p className="mt-2 text-3xl font-semibold tracking-tight">
          {value}
        </p>
      )}

      {description && (
        <p className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
