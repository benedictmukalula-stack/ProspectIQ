"use client";

import { leadGrowthData } from "../lib/mock-data";

export function LeadGrowthChart() {
  const maxLeads = Math.max(...leadGrowthData.map((d) => d.leads));

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Lead Growth</h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            Monthly lead acquisition and qualification
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-zinc-400">Leads</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400/30" />
            <span className="text-zinc-400">Qualified</span>
          </div>
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div className="flex items-end gap-2 sm:gap-4" style={{ height: 160 }}>
        {leadGrowthData.map((point) => {
          const leadsHeight = (point.leads / maxLeads) * 100;
          const qualifiedHeight = (point.qualified / maxLeads) * 100;

          return (
            <div
              key={point.month}
              className="group flex flex-1 flex-col items-center gap-1"
            >
              {/* Stacked bars */}
              <div className="relative flex w-full flex-col items-center" style={{ height: 140 }}>
                {/* Qualified bar (behind) */}
                <div className="absolute bottom-0 w-full rounded-t-md bg-emerald-400/15 transition-all duration-500 group-hover:bg-emerald-400/25"
                  style={{ height: `${qualifiedHeight}%` }}
                />
                {/* Total leads bar (front, offset) */}
                <div className="absolute bottom-0 w-3/5 rounded-t-md bg-emerald-400/50 transition-all duration-500 group-hover:bg-emerald-400/70"
                  style={{ height: `${leadsHeight}%` }}
                />
              </div>
              {/* Label */}
              <span className="mt-2 text-[11px] text-zinc-500">{point.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
