const suggestions = [
  {
    title: "Generate cold outreach",
    description: "Create a personalized email for logistics decision makers.",
  },
  {
    title: "Summarize prospect",
    description: "Turn lead notes into a concise sales briefing.",
  },
  {
    title: "Improve subject line",
    description: "Rewrite subject lines for better open rates.",
  },
  {
    title: "Recommend follow-up",
    description: "Suggest the next best action for warm leads.",
  },
];

const messages = [
  {
    role: "AI Assistant",
    text: "I found 8 warm logistics leads that should be followed up today.",
  },
  {
    role: "You",
    text: "Draft a follow-up email for Atlas Freight.",
  },
  {
    role: "AI Assistant",
    text: "Suggested draft: Hi Sarah, following up on our discussion around improving freight visibility and outbound operations...",
  },
];

export default function AIAssistantPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ Copilot</p>
        <h1 className="mt-2 text-3xl font-bold">AI Assistant</h1>
        <p className="mt-2 text-slate-400">
          Phase 5C AI sales assistant interface using mock responses only.
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 xl:col-span-2">
          <h2 className="text-lg font-semibold">Assistant Chat</h2>
          <p className="mt-1 text-sm text-slate-400">
            Mock AI conversation. Real model connection comes later.
          </p>

          <div className="mt-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`rounded-2xl p-4 ${
                  message.role === "You"
                    ? "ml-auto max-w-xl bg-blue-500 text-white"
                    : "max-w-xl bg-slate-900/80 text-slate-300"
                }`}
              >
                <p className="mb-2 text-xs opacity-70">{message.role}</p>
                <p className="text-sm leading-6">{message.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <input
              className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="Ask ProspectIQ AI to draft, summarize, score, or recommend..."
            />

            <button className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-medium text-white">
              Send — Coming Soon
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Quick Actions</h2>

          <div className="mt-5 space-y-4">
            {suggestions.map((item) => (
              <button
                key={item.title}
                className="w-full rounded-xl bg-slate-900/80 p-4 text-left hover:bg-slate-800"
              >
                <p className="font-medium text-white">{item.title}</p>
                <p className="mt-1 text-sm text-slate-400">{item.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-slate-400">Emails Drafted</p>
          <h3 className="mt-3 text-3xl font-bold">126</h3>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-slate-400">Leads Summarized</p>
          <h3 className="mt-3 text-3xl font-bold">342</h3>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-slate-400">Follow-ups Suggested</p>
          <h3 className="mt-3 text-3xl font-bold">89</h3>
        </div>
      </section>
    </div>
  );
}
