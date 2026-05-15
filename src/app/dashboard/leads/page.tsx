const leads = [
  { name: "Sarah M.", company: "Atlas Freight", role: "Operations Director", email: "sarah@atlasfreight.example", score: 92, status: "Warm" },
  { name: "James K.", company: "TradeLink Africa", role: "Procurement Lead", email: "james@tradelink.example", score: 88, status: "Hot" },
  { name: "Lerato N.", company: "CargoPrime", role: "Managing Director", email: "lerato@cargoprime.example", score: 84, status: "Warm" },
  { name: "Daniel P.", company: "ExportHub", role: "Commercial Manager", email: "daniel@exporthub.example", score: 79, status: "New" },
];

export default function LeadsPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ CRM</p>
        <h1 className="mt-2 text-3xl font-bold">Leads</h1>
        <p className="mt-2 text-slate-400">Phase 4A lead management using mock data only.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold">Lead Database</h2>
          <button className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white">
            Add Lead — Coming Soon
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="py-3">Name</th>
                <th className="py-3">Company</th>
                <th className="py-3">Role</th>
                <th className="py-3">Email</th>
                <th className="py-3">Score</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.email} className="border-t border-white/10 text-slate-300">
                  <td className="py-4 font-medium text-white">{lead.name}</td>
                  <td className="py-4">{lead.company}</td>
                  <td className="py-4">{lead.role}</td>
                  <td className="py-4">{lead.email}</td>
                  <td className="py-4">
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-300">
                      {lead.score}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="rounded-full bg-blue-400/10 px-3 py-1 text-blue-300">
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
