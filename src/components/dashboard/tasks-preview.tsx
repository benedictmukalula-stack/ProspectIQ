import {
  tasks,
  getPriorityColor,
  type TaskItem,
} from "@/lib/mock-data";
import { Check } from "lucide-react";

export function TasksPreview() {
  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Tasks</h3>
        <p className="mt-0.5 text-xs text-zinc-500">
          {pending.length} pending, {completed.length} completed
        </p>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 rounded-lg border border-white/[0.04] px-3 py-2.5 transition-colors ${
              task.completed ? "opacity-50" : ""
            }`}
          >
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                task.completed
                  ? "border-emerald-500/50 bg-emerald-500/20"
                  : "border-white/[0.1]"
              }`}
            >
              {task.completed && <Check className="h-3 w-3 text-emerald-400" />}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-xs ${
                  task.completed
                    ? "text-zinc-500 line-through"
                    : "text-zinc-300"
                }`}
              >
                {task.title}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium capitalize ${getPriorityColor(task.priority)}`}
              >
                {task.priority}
              </span>
              <span className="text-[10px] text-zinc-600">{task.dueDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
