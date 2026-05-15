const kpis = [
  { label: "Total Leads", value: "2,847", change: "+18%" },
  { label: "Active Campaigns", value: "12", change: "+4" },
  { label: "Reply Rate", value: "14.8%", change: "+2.1%" },
  { label: "Pipeline Value", value: "$184K", change: "+27%" },
];

const activities = [
  "New lead added: Sarah M. from Atlas Freight",
  "Email opened by James K. at TradeLink Africa",
  "Campaign completed: Logistics Decision Makers",
  "AI suggested follow-up for 8 warm leads",
];

const prospects = [
  ["Sarah M.", "Atlas Freight", "Operations Director", "92"],
  ["James K.", "TradeLink Africa", "Procurement Lead", "88"],
  ["Lerato N.", "CargoPrime", "Managing Director", "84"],
  ["Daniel P.", "ExportHub", "Commercial Manager", "79"],
];

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="mt-2 text-slate-400">
          Monitor leads, campaigns, pipeline activity, and AI sales insights.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">{kpi.label}</p>
            <div className="mt-3 flex items-end justify-between">
              <p className="text-3xl font-bold">{kpi.value}</p>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 xl:col-span-2">
          <h3 className="text-lg font-semibold">Lead Growth</h3>
          <p className="mt-1 text-sm text-slate-400">Mock 6-month performance trend</p>

          <div className="mt-8 flex h-64 items-end gap-4">
            {[35, 52, 48, 70, 82, 96].map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-3">
                <div className="w-full rounded-t-xl bg-blue-500" style={{ height: `${height}%` }} />
                <span className="text-xs text-slate-500">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun"][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold">AI Insights</h3>
          <div className="mt-5 space-y-4 text-sm text-slate-300">
            <p className="rounded-xl bg-slate-900/80 p-4">
              Best-performing segment: Logistics managers in South Africa.
            </p>
            <p className="rounded-xl bg-slate-900/80 p-4">
              Recommended follow-up window: 9 AM–11 AM.
            </p>
            <p className="rounded-xl bg-slate-900/80 p-4">
              8 warm leads should be prioritized today.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <div className="mt-5 space-y-3">
            {activities.map((activity) => (
              <div key={activity} className="rounded-xl bg-slate-900/70 p-4 text-sm text-slate-300">
                {activity}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold">Top Prospects</h3>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="py-3">Name</th>
                  <th className="py-3">Company</th>
                  <th className="py-3">Role</th>
                  <th className="py-3">Score</th>
                </tr>
              </thead>
              <tbody>
                {prospects.map(([name, company, role, score]) => (
                  <tr key={name} className="border-t border-white/10 text-slate-300">
                    <td className="py-4">{name}</td>
                    <td className="py-4">{company}</td>
                    <td className="py-4">{role}</td>
                    <td className="py-4">
                      <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-300">
                        {score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
