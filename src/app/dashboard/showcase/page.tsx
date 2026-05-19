"use client"

import { useEffect, useState } from "react"

export default function ShowcasePage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const response = await fetch(
        "/api/showcase/platform",
        {
          cache: "no-store",
        }
      )

      const result = await response.json()
      setData(result)
    }

    load()
  }, [])

  const maturity = data?.maturity || {}
  const capabilityMap =
    data?.capabilityMap || []

  const positioning =
    data?.positioning || {}

  const modules = data?.modules || []

  return (
    <main className="space-y-8">
      <section className="rounded-3xl border bg-gradient-to-br from-violet-950 via-slate-900 to-black p-8 text-white">
        <p className="text-sm text-violet-300">
          Enterprise Productization Layer
        </p>

        <h1 className="mt-2 text-5xl font-bold tracking-tight">
          ProspectIQ Platform Showcase
        </h1>

        <p className="mt-5 max-w-4xl text-sm leading-6 text-slate-300">
          Enterprise autonomous intelligence
          infrastructure for cognitive
          operations, strategic governance,
          semantic reasoning, predictive
          execution, and autonomous enterprise
          coordination.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            [
              "Maturity",
              `${maturity.maturity || 0}%`,
            ],
            [
              "Category",
              maturity.category ||
                "Loading",
            ],
            [
              "Modules",
              modules.length,
            ],
            [
              "Position",
              "Enterprise AI",
            ],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <p className="text-xs text-slate-300">
                {label}
              </p>

              <p className="mt-3 text-2xl font-semibold">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border p-6">
          <p className="text-sm font-medium">
            Market Positioning
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">
                Category
              </p>

              <p className="mt-1 text-lg font-semibold">
                {
                  positioning.category
                }
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Market Position
              </p>

              <p className="mt-1 text-lg font-semibold">
                {
                  positioning.marketPosition
                }
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border p-6">
          <p className="text-sm font-medium">
            Competitive Differentiation
          </p>

          <div className="mt-5 space-y-3">
            {(
              positioning.differentiation ||
              []
            ).map(
              (
                item: string,
                index: number
              ) => (
                <div
                  key={index}
                  className="rounded-xl border p-3 text-sm"
                >
                  {item}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              Enterprise Capability Map
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              High-level platform
              architecture and operational
              intelligence layers.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {capabilityMap.map(
            (
              capability: any,
              index: number
            ) => (
              <div
                key={index}
                className="rounded-2xl border p-5"
              >
                <h2 className="text-lg font-semibold">
                  {capability.layer}
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  {capability.modules.map(
                    (
                      module: string,
                      moduleIndex: number
                    ) => (
                      <span
                        key={moduleIndex}
                        className="rounded-full border px-3 py-1 text-xs"
                      >
                        {module}
                      </span>
                    )
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </section>

      <section className="rounded-2xl border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              Enterprise Demo Journey
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Suggested executive walkthrough
              flow for enterprise demos.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            [
              "1",
              "Executive Dashboard",
              "/dashboard/executive",
            ],

            [
              "2",
              "AI Council",
              "/dashboard/council",
            ],

            [
              "3",
              "Risk Center",
              "/dashboard/risk",
            ],

            [
              "4",
              "Infrastructure",
              "/dashboard/infrastructure",
            ],

            [
              "5",
              "Simulation",
              "/dashboard/simulation",
            ],

            [
              "6",
              "Execution",
              "/dashboard/execution",
            ],
          ].map(
            (
              [step, label, href],
              index
            ) => (
              <a
                key={index}
                href={href}
                className="rounded-2xl border p-5 transition hover:bg-muted"
              >
                <p className="text-xs text-muted-foreground">
                  Step {step}
                </p>

                <h2 className="mt-2 text-lg font-semibold">
                  {label}
                </h2>

                <p className="mt-3 text-sm text-muted-foreground">
                  Open enterprise module
                </p>
              </a>
            )
          )}
        </div>
      </section>
    </main>
  )
}
