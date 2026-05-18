"use client"

import { useMemo, useState } from "react"

const contextCards = [
  ["Leads", "128", "Prioritize high-fit prospects and next actions."],
  ["Pipeline", "$182K", "Forecast revenue and stalled opportunities."],
  ["Outbound", "3 sequences", "Review email performance and engagement."],
  ["AI Workflows", "6 workflows", "Run scoring, drafting, routing, and enrichment."],
]

const promptLibrary = [
  "Which leads should I contact first today?",
  "Summarize my pipeline and highlight stalled deals.",
  "Draft a personalized outbound email for a logistics decision maker.",
  "What campaigns should I run next?",
  "Identify high-intent accounts from recent engagement.",
  "Create follow-up tasks for prospects who opened emails.",
]

function generateMockAnswer(question: string, mode: string) {
  const q = question.toLowerCase()

  if (q.includes("lead") || mode === "lead") {
    return `Lead Intelligence Summary

Top recommended leads:
1. Thabo Mokoena — Head of Operations, AfriBridge Logistics — Score 87/100
2. Michael Dlamini — Managing Director, Dlamini Industrial Supply — Score 91/100
3. Sarah Naidoo — Sales Director, Cape Trade Group — Score 74/100

Recommended next action:
Prioritize Thabo and Michael for personalized outreach. Both show strong operational relevance and likely buying influence.

Suggested workflow:
Run lead scoring → create task → enroll into Standard ProspectIQ Outreach sequence.`
  }

  if (q.includes("pipeline") || mode === "pipeline") {
    return `Pipeline Intelligence Summary

Current pipeline health looks positive, with strong activity in Qualified, Proposal, and Negotiation stages.

Key observations:
- Weighted forecast is strongest in enterprise opportunities.
- Negotiation-stage opportunities should receive senior follow-up.
- Early-stage deals need more engagement signals before aggressive outreach.

Recommended next action:
Focus on opportunities older than 5 days and run an AI forecast review on high-value accounts.`
  }

  if (q.includes("email") || q.includes("outbound") || mode === "outbound") {
    return `Outbound Strategy Recommendation

Your outbound foundation is active:
- Sequences are configured.
- Send queue is operational.
- Mock provider delivery works.
- Engagement events are being recorded.

Recommended next action:
Move from mock sending to Resend or Amazon SES, then add bounce, open, click, and reply webhooks.

Suggested email angle:
Lead with operational visibility, workflow automation, and measurable pipeline consistency.`
  }

  if (q.includes("campaign") || mode === "campaign") {
    return `Campaign Recommendation

Best campaign to run next:
"Operations Decision Makers Outreach"

Audience:
Operations Directors, Sales Directors, Managing Directors, and business owners in logistics, trade, training, and automotive services.

Message angle:
Position ProspectIQ as an AI sales intelligence platform that reduces manual research, improves prioritization, and standardizes follow-up.`
  }

  return `AI Workspace Summary

ProspectIQ is operating as an AI sales intelligence command center.

Strongest areas:
- LinkedIn research
- Lead scoring
- CRM pipeline visibility
- Outbound sequences
- Send queue
- AI workflows
- Engagement tracking

Recommended next action:
Focus on turning mock workflows into production workflows by connecting email provider, enforcing RLS, and improving analytics depth.`
}

export default function AIAssistantPage() {
  const [mode, setMode] = useState("workspace")
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [history, setHistory] = useState<any[]>([])

  const modeLabel = useMemo(() => {
    return {
      workspace: "Workspace Intelligence",
      lead: "Lead Prioritization",
      pipeline: "Pipeline Strategy",
      outbound: "Outbound Automation",
      campaign: "Campaign Planning",
    }[mode]
  }, [mode])

  function askAssistant(prompt?: string) {
    const finalQuestion = prompt || question

    if (!finalQuestion.trim()) return

    const response = generateMockAnswer(finalQuestion, mode)

    setAnswer(response)
    setHistory((current) => [
      {
        question: finalQuestion,
        answer: response,
        mode,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ])

    setQuestion("")
  }

  return (
    <main className="space-y-8">
      <section className="rounded-2xl border bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
        <p className="text-sm text-slate-300">ProspectIQ AI Copilot</p>
        <h1 className="mt-2 text-3xl font-bold">Premium AI Assistant</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Ask strategic questions across leads, companies, pipeline, campaigns, outbound activity, and AI workflows.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {contextCards.map(([label, value, description]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-300">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
              <p className="mt-1 text-xs text-slate-400">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-xl border p-6">
          <div className="flex flex-wrap gap-2">
            {[
              ["workspace", "Workspace"],
              ["lead", "Leads"],
              ["pipeline", "Pipeline"],
              ["outbound", "Outbound"],
              ["campaign", "Campaigns"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`rounded-lg border px-4 py-2 text-sm hover:bg-muted ${mode === key ? "bg-muted" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium">{modeLabel}</p>
            <textarea
              className="mt-3 min-h-36 w-full rounded-xl border p-4 text-sm"
              placeholder="Ask ProspectIQ AI what to do next..."
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />

            <div className="mt-3 flex flex-wrap gap-3">
              <button onClick={() => askAssistant()} className="rounded-lg bg-black px-4 py-2 text-sm text-white">
                Ask Assistant
              </button>
              <button onClick={() => setQuestion("")} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                Clear
              </button>
            </div>
          </div>

          {answer && (
            <div className="mt-6 rounded-xl bg-muted p-5">
              <h2 className="font-semibold">AI Recommendation</h2>
              <pre className="mt-3 whitespace-pre-wrap text-sm font-sans leading-6">{answer}</pre>

              <div className="mt-5 flex flex-wrap gap-3">
                <a href="/dashboard/tasks" className="rounded-lg border px-4 py-2 text-sm hover:bg-background">
                  Create Task
                </a>
                <a href="/dashboard/sequences" className="rounded-lg border px-4 py-2 text-sm hover:bg-background">
                  Add to Sequence
                </a>
                <a href="/dashboard/ai-workflows" className="rounded-lg border px-4 py-2 text-sm hover:bg-background">
                  Run Workflow
                </a>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border p-6">
            <h2 className="text-lg font-semibold">Suggested Prompts</h2>
            <div className="mt-4 space-y-2">
              {promptLibrary.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => askAssistant(prompt)}
                  className="w-full rounded-lg border p-3 text-left text-sm hover:bg-muted"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-6">
            <h2 className="text-lg font-semibold">Assistant Readiness</h2>
            <div className="mt-4 space-y-3 text-sm">
              {[
                ["Workspace context", "Active"],
                ["Mock reasoning", "Active"],
                ["Workflow actions", "Ready"],
                ["Live LLM provider", "Pending"],
                ["CRM writeback", "Pending"],
              ].map(([label, status]) => (
                <div key={label} className="flex justify-between border-b pb-2 last:border-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Recent AI Conversations</h2>

        <div className="mt-4 space-y-3">
          {history.length ? (
            history.map((item, index) => (
              <div key={index} className="rounded-lg border p-4">
                <p className="text-sm font-medium">{item.question}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.mode} · {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No AI questions asked in this session yet.</p>
          )}
        </div>
      </section>
    </main>
  )
}
