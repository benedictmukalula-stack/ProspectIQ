"use client"

import { useEffect, useState } from "react"

type EnterpriseModule = {
  name: string
  dashboardPath: string
  apiPath: string
  status: string
}

type EnterpriseStatus = {
  success: boolean
  status: string
  modules: EnterpriseModule[]
  summary: {
    registeredModules: number
    enterpriseLayer: boolean
    autonomousGovernance: boolean
    commercialMetering: boolean
    executiveBoardroom: boolean
    runtimeExecution: boolean
  }
}

export default function EnterpriseStatusPage() {
  const [data, setData] = useState<EnterpriseStatus | null>(null)

  async function loadStatus() {
    const res = await fetch("/api/system/enterprise-status", {
      cache: "no-store",
    })
    const json = await res.json()
    setData(json)
  }

  useEffect(() => {
    loadStatus()
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
            ProspectIQ Enterprise Runtime
          </p>
          <h1 className="mt-2 text-4xl font-semibold">
            Enterprise System Status
          </h1>
          <p className="mt-3 max-w-4xl text-slate-300">
            Unified registration view for autonomous governance, boardroom
            intelligence, runtime execution, platform mesh, commercial metering,
            and executive operating modules.
          </p>
        </div>

        <button
          onClick={loadStatus}
          className="rounded-xl border border-cyan-400/40 px-5 py-3 text-sm font-medium text-cyan-200 hover:bg-cyan-400/10"
        >
          Refresh Status
        </button>
      </header>

      {!data ? (
        <p className="text-slate-300">Loading enterprise status...</p>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            <Metric label="System" value={data.status} />
            <Metric label="Modules" value={data.summary.registeredModules} />
            <Metric label="Governance" value={data.summary.autonomousGovernance ? "active" : "off"} />
            <Metric label="Boardroom" value={data.summary.executiveBoardroom ? "active" : "off"} />
            <Metric label="Commercial" value={data.summary.commercialMetering ? "active" : "off"} />
            <Metric label="Runtime" value={data.summary.runtimeExecution ? "active" : "off"} />
          </section>

          <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
            <h2 className="text-xl font-semibold">Registered Enterprise Modules</h2>
            <p className="mt-1 text-sm text-slate-400">
              Each row maps a dashboard surface to its supporting API layer.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-white/10 text-slate-400">
                  <tr>
                    <th className="py-3 pr-4">Module</th>
                    <th className="py-3 pr-4">Dashboard</th>
                    <th className="py-3 pr-4">API</th>
                    <th className="py-3 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.modules.map((module) => (
                    <tr key={module.name} className="border-b border-white/5">
                      <td className="py-4 pr-4 font-medium">{module.name}</td>
                      <td className="py-4 pr-4 text-cyan-300">{module.dashboardPath}</td>
                      <td className="py-4 pr-4 text-slate-300">{module.apiPath}</td>
                      <td className="py-4 pr-4">
                        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs uppercase text-emerald-200">
                          {module.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold capitalize">{value}</p>
    </div>
  )
}
