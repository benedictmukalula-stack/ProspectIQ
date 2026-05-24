import {
  topProspects,
  getStatusColor,
  type Lead,
} from "../lib/mock-data";

export function TopProspectsTable() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <div className="border-b border-white/[0.06] px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Top Prospects</h3>
            <p className="mt-0.5 text-xs text-zinc-500">
              Highest scoring leads in your pipeline
            </p>
          </div>
          <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] font-medium text-zinc-400">
            {topProspects.length} leads
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.04] text-left text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 sm:px-6">Lead</th>
              <th className="hidden px-4 py-3 sm:table-cell">Company</th>
              <th className="hidden px-4 py-3 md:table-cell">Source</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {topProspects.map((lead) => (
              <tr
                key={lead.id}
                className="transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xs font-semibold text-zinc-400">
                      {lead.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-200">
                        {lead.name}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        {lead.role}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <span className="text-zinc-400">{lead.company}</span>
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <span className="text-xs text-zinc-500">{lead.source}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${getStatusColor(lead.status)}`}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`font-semibold ${
                      lead.score >= 85
                        ? "text-emerald-400"
                        : lead.score >= 75
                          ? "text-zinc-300"
                          : "text-zinc-500"
                    }`}
                  >
                    {lead.score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
