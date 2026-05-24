import {
  activityFeed,
  type ActivityItem,
} from "../lib/mock-data";
import { Mail, UserPlus, Calendar, CheckSquare, Zap } from "lucide-react";

function getTypeIcon(type: ActivityItem["type"]) {
  const iconClass = "h-3.5 w-3.5";
  switch (type) {
    case "lead":
      return <UserPlus className={`${iconClass} text-emerald-400`} />;
    case "email":
      return <Mail className={`${iconClass} text-blue-400`} />;
    case "meeting":
      return <Calendar className={`${iconClass} text-purple-400`} />;
    case "task":
      return <CheckSquare className={`${iconClass} text-amber-400`} />;
    case "system":
      return <Zap className={`${iconClass} text-zinc-400`} />;
  }
}

function getTypeBg(type: ActivityItem["type"]): string {
  switch (type) {
    case "lead":
      return "bg-emerald-500/10";
    case "email":
      return "bg-blue-500/10";
    case "meeting":
      return "bg-purple-500/10";
    case "task":
      return "bg-amber-500/10";
    case "system":
      return "bg-zinc-500/10";
  }
}

export function ActivityFeedWidget() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Activity Feed</h3>
        <p className="mt-0.5 text-xs text-zinc-500">Recent actions and updates</p>
      </div>

      <div className="space-y-3">
        {activityFeed.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${getTypeBg(item.type)}`}
            >
              {getTypeIcon(item.type)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-zinc-300">{item.action}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                {item.detail}
              </p>
              <p className="mt-1 text-[10px] text-zinc-600">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
