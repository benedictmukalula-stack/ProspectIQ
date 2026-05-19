export function ExecutiveHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border bg-gradient-to-br from-slate-950 via-slate-900 to-black p-8 text-white shadow-xl">
      <p className="text-sm text-slate-300">{eyebrow}</p>

      <h1 className="mt-2 max-w-5xl text-4xl font-bold tracking-tight md:text-5xl">
        {title}
      </h1>

      <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-300">
        {description}
      </p>

      {children && <div className="mt-6">{children}</div>}
    </section>
  )
}
