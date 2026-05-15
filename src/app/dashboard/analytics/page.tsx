const metrics = [
  { label: "Total Reach", value: "18,420", change: "+22%" },
  { label: "Open Rate", value: "47.3%", change: "+5.8%" },
  { label: "Reply Rate", value: "13.9%", change: "+2.4%" },
  { label: "Qualified Leads", value: "384", change: "+31%" },
];

const funnel = [
  { stage: "Prospects Found", value: 2847 },
  { stage: "Emails Sent", value: 1840 },
  { stage: "Opened", value: 870 },
  { stage: "Replied", value: 256 },
  { stage: "Qualified", value: 84 },
];

const campaigns = [
  ["Logistics Decision Makers", "48%", "14%", "1240"],
  ["African Freight Network", "42%", "11%", "860"],
  ["Import Export Executives", "51%", "17%", "540"],
];

export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ Intelligence</p>
        <h1 className="mt-2 text-3xl font-bold">Analytics</h1>
        <p className="mt-2 text-slate-400">
          Phase 5B performance analytics using mock data only.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">{metric.label}</p>
            <div className="mt-3 flex items-end justify-between">
              <p className="text-3xl font-bold">{metric.value}</p>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 xl:col-span-2">
          <h2 className="text-lg font-semibold">Outbound Funnel</h2>
          <p className="mt-1 text-sm text-slate-400">
            Visual funnel from prospect discovery to qualified lead.
          </p>

          <div className="mt-6 space-y-4">
            {funnel.map((item, index) => (
              <div key={item.stage}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-300">{item.stage}</span>
                  <span className="text-slate-400">{item.value}</span>
                </div>

                <div className="h-3 rounded-full bg-slate-800">
                  <div
                    className="h-3 rounded-full bg-blue-500"
                    style={{ width: `${100 - index * 16}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Revenue Influence</h2>
          <p className="mt-1 text-sm text-slate-400">
            Mock pipeline influence by outbound activity.
          </p>

          <div className="mt-8 flex h-60 items-end gap-3">
            {[42, 58, 64, 72, 84, 96].map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-3">
                <div className="w-full rounded-t-xl bg-emerald-500" style={{ height: `${height}%` }} />
                <span className="text-xs text-slate-500">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun"][index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold">Campaign Performance</h2>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="py-3">Campaign</th>
                <th className="py-3">Open Rate</th>
                <th className="py-3">Reply Rate</th>
                <th className="py-3">Emails Sent</th>
              </tr>
            </thead>

            <tbody>
              {campaigns.map(([name, open, reply, sent]) => (
                <tr key={name} className="border-t border-white/10 text-slate-300">
                  <td className="py-4 font-medium text-white">{name}</td>
                  <td className="py-4 text-emerald-300">{open}</td>
                  <td className="py-4 text-amber-300">{reply}</td>
                  <td className="py-4">{sent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
