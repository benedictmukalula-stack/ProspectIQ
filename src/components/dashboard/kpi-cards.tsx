"use client";

import {
  kpiStats,
  type KpiStat,
} from "@/lib/mock-data";
import { TrendingUp, TrendingDown } from "lucide-react";

function KpiCard({ stat }: { stat: KpiStat }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.1]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500">{stat.label}</span>
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
            stat.trendDirection === "up"
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {stat.trendDirection === "up" ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {stat.trend}
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
      <p className="mt-1 text-[11px] text-zinc-600">vs. previous month</p>
    </div>
  );
}

export function KpiCards() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {kpiStats.map((stat) => (
        <KpiCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}
