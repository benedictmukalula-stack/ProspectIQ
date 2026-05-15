const companies = [
  {
    name: "Atlas Freight",
    industry: "Logistics",
    location: "Johannesburg, South Africa",
    employees: "120",
    pipeline: "$48K",
    status: "Active",
  },
  {
    name: "TradeLink Africa",
    industry: "Supply Chain",
    location: "Lusaka, Zambia",
    employees: "64",
    pipeline: "$32K",
    status: "Prospect",
  },
  {
    name: "CargoPrime",
    industry: "Freight Forwarding",
    location: "Nairobi, Kenya",
    employees: "210",
    pipeline: "$76K",
    status: "Negotiation",
  },
  {
    name: "ExportHub",
    industry: "Exports",
    location: "Cape Town, South Africa",
    employees: "42",
    pipeline: "$18K",
    status: "New",
  },
];

export default function CompaniesPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ CRM</p>

        <h1 className="mt-2 text-3xl font-bold">Companies</h1>

        <p className="mt-2 text-slate-400">
          Phase 4B company intelligence using mock data only.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {companies.map((company) => (
          <div
            key={company.name}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">{company.name}</h2>

                <p className="mt-1 text-sm text-slate-400">
                  {company.industry}
                </p>
              </div>

              <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-300">
                {company.status}
              </span>
            </div>

            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Location</span>
                <span>{company.location}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Employees</span>
                <span>{company.employees}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Pipeline</span>
                <span className="text-emerald-300">
                  {company.pipeline}
                </span>
              </div>
            </div>

            <button className="mt-6 w-full rounded-xl bg-slate-800 px-4 py-3 text-sm text-slate-200 hover:bg-slate-700">
              View Company — Coming Soon
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
