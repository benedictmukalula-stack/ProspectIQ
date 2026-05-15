const tasks = [
  {
    title: "Follow up with Atlas Freight",
    owner: "Benedict",
    related: "Sarah M. — Atlas Freight",
    due: "Today",
    priority: "High",
    status: "Todo",
  },
  {
    title: "Review campaign performance",
    owner: "Benedict",
    related: "Logistics Decision Makers",
    due: "Today",
    priority: "Medium",
    status: "In Progress",
  },
  {
    title: "Prepare proposal for CargoPrime",
    owner: "Benedict",
    related: "Lerato N. — CargoPrime",
    due: "Tomorrow",
    priority: "High",
    status: "Todo",
  },
  {
    title: "Update lead scoring rules",
    owner: "Benedict",
    related: "CRM Settings",
    due: "This week",
    priority: "Low",
    status: "Done",
  },
];

export default function TasksPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ CRM</p>
        <h1 className="mt-2 text-3xl font-bold">Tasks</h1>
        <p className="mt-2 text-slate-400">
          Phase 4D task management using mock data only.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold">Task Queue</h2>

          <button className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white">
            Add Task — Coming Soon
          </button>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.title}
              className="rounded-2xl border border-white/10 bg-slate-900/80 p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{task.title}</h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Related: {task.related}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">
                    Owner: {task.owner}
                  </span>

                  <span className="rounded-full bg-blue-400/10 px-3 py-1 text-blue-300">
                    {task.due}
                  </span>

                  <span className="rounded-full bg-amber-400/10 px-3 py-1 text-amber-300">
                    {task.priority}
                  </span>

                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-300">
                    {task.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
