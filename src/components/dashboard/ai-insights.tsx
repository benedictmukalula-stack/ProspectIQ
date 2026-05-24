import {
  aiInsights,
  type AiInsight,
} from "../lib/mock-data";
import { TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

function getInsightConfig(type: AiInsight["type"]) {
  switch (type) {
    case "opportunity":
      return {
        icon: TrendingUp,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        label: "Opportunity",
      };
    case "risk":
      return {
        icon: AlertTriangle,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        label: "Risk",
      };
    case "suggestion":
      return {
        icon: Lightbulb,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        label: "Suggestion",
      };
  }
}

export function AiInsightsPreview() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">AI Insights</h3>
        <p className="mt-0.5 text-xs text-zinc-500">
          Machine learning observations and recommendations
        </p>
      </div>

      <div className="space-y-3">
        {aiInsights.map((insight) => {
          const config = getInsightConfig(insight.type);
          return (
            <div
              key={insight.id}
              className="rounded-lg border border-white/[0.04] p-3 transition-colors hover:border-white/[0.08]"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${config.bg}`}
                >
                  <config.icon className={`h-3.5 w-3.5 ${config.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-xs font-medium text-zinc-200">
                      {insight.title}
                    </p>
                    <span className="shrink-0 text-[10px] text-zinc-600">
                      {insight.confidence}% confidence
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
