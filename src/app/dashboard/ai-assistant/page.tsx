"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createBrowserSupabaseClient,
  isDemoMode,
  supabaseAuth,
} from "@/lib/supabase/client";

type Lead = {
  id: string;
  name: string;
  company: string;
  role: string | null;
  email: string | null;
  score: number;
  status: string;
};

type Campaign = {
  id: string;
  name: string;
  audience: string;
  status: string;
  steps?: unknown;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Sarah M.",
    company: "Atlas Freight",
    role: "Operations Director",
    email: "sarah@atlasfreight.example",
    score: 92,
    status: "Warm",
  },
  {
    id: "2",
    name: "James K.",
    company: "TradeLink Africa",
    role: "Procurement Lead",
    email: "james@tradelink.example",
    score: 88,
    status: "Hot",
  },
];

const starterMessages: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Ask me about your leads, hot accounts, pipeline, campaigns, or next best sales actions.",
  },
];

function normalizeQuestion(question: string) {
  return question.toLowerCase().trim();
}

function buildCompanySummary(leads: Lead[]) {
  const grouped = leads.reduce<Record<string, Lead[]>>((groups, lead) => {
    groups[lead.company] = groups[lead.company] || [];
    groups[lead.company].push(lead);
    return groups;
  }, {});

  return Object.entries(grouped)
    .map(([company, contacts]) => {
      const avgScore = Math.round(
        contacts.reduce((sum, lead) => sum + lead.score, 0) / contacts.length
      );

      return {
        company,
        contacts,
        avgScore,
        hotContacts: contacts.filter((lead) => lead.status === "Hot").length,
        qualifiedContacts: contacts.filter((lead) => lead.status === "Qualified").length,
      };
    })
    .sort((a, b) => b.avgScore - a.avgScore);
}

function answerFromContext(question: string, leads: Lead[], campaigns: Campaign[]) {
  const q = normalizeQuestion(question);
  const companies = buildCompanySummary(leads);
  const hotLeads = leads.filter((lead) => lead.status === "Hot");
  const qualifiedLeads = leads.filter((lead) => lead.status === "Qualified");
  const topLeads = [...leads].sort((a, b) => b.score - a.score).slice(0, 5);
  const averageScore = leads.length
    ? Math.round(leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length)
    : 0;

  if (q.includes("hot") || q.includes("priority") || q.includes("best lead")) {
    if (!topLeads.length) return "No leads are available yet. Add leads first, then I can prioritize them.";

    return `Top priority leads:\n\n${topLeads
      .map(
        (lead, index) =>
          `${index + 1}. ${lead.name} at ${lead.company} — score ${lead.score}, status ${lead.status}. ${
            lead.role ? `Role: ${lead.role}.` : "Role not captured."
          }`
      )
      .join("\n")}\n\nRecommended action: start with the highest-scored leads and move Hot/Qualified contacts into active outreach.`;
  }

  if (q.includes("company") || q.includes("account")) {
    if (!companies.length) return "No company intelligence is available yet because there are no leads.";

    return `Top account intelligence:\n\n${companies
      .slice(0, 5)
      .map(
        (company, index) =>
          `${index + 1}. ${company.company} — ${company.contacts.length} contact(s), average score ${company.avgScore}, ${company.hotContacts} hot, ${company.qualifiedContacts} qualified.`
      )
      .join("\n")}\n\nRecommended action: focus on accounts with high average score and multiple contacts first.`;
  }

  if (q.includes("campaign") || q.includes("sequence") || q.includes("outreach")) {
    if (!campaigns.length) {
      return `No live campaigns are available yet. Create a campaign sequence for ${
        hotLeads.length + qualifiedLeads.length
      } Hot/Qualified lead(s).`;
    }

    return `Campaign summary:\n\n${campaigns
      .map(
        (campaign, index) =>
          `${index + 1}. ${campaign.name} — audience: ${campaign.audience}, status: ${campaign.status}.`
      )
      .join("\n")}\n\nRecommended action: use Ready campaigns for Hot and Qualified leads first, then create nurture campaigns for Warm leads.`;
  }

  if (q.includes("pipeline") || q.includes("status") || q.includes("stage")) {
    const statuses = ["New", "Warm", "Hot", "Qualified", "Contacted"];

    return `Pipeline breakdown:\n\n${statuses
      .map((status) => {
        const count = leads.filter((lead) => lead.status === status).length;
        return `${status}: ${count}`;
      })
      .join("\n")}\n\nRecommended action: move Warm leads toward Qualified by adding missing role/email data and running AI scoring.`;
  }

  if (q.includes("analytics") || q.includes("summary") || q.includes("overview")) {
    return `Workspace overview:\n\nTotal leads: ${leads.length}\nAverage score: ${averageScore}\nHot leads: ${hotLeads.length}\nQualified leads: ${qualifiedLeads.length}\nCompanies: ${companies.length}\nCampaigns: ${campaigns.length}\n\nRecommended action: prioritize Hot leads, enrich companies with multiple contacts, and connect campaigns to outreach execution.`;
  }

  return `Based on your workspace data, you currently have ${leads.length} lead(s), ${companies.length} compan${
    companies.length === 1 ? "y" : "ies"
  }, and ${campaigns.length} campaign(s). Average lead score is ${averageScore}.\n\nTry asking:\n- Which leads should I contact first?\n- Which companies are strongest?\n- Summarize my pipeline\n- What campaign should I run next?`;
}

export default function AiAssistantPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(!isDemoMode);
  const [message, setMessage] = useState("");

  async function getWorkspace() {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      return {
        supabase: null,
        organizationId: null,
        error: "Supabase client unavailable.",
      };
    }

    const userResult = await supabaseAuth.getUser();

    if (userResult.error || !userResult.data.user) {
      return {
        supabase,
        organizationId: null,
        error: "No active session.",
      };
    }

    const workspaceResult = await supabase.rpc("ensure_user_workspace");

    if (workspaceResult.error || !workspaceResult.data?.[0]) {
      return {
        supabase,
        organizationId: null,
        error: "Workspace not ready.",
      };
    }

    return {
      supabase,
      organizationId: workspaceResult.data[0].organization_id,
      error: null,
    };
  }

  useEffect(() => {
    async function loadWorkspaceContext() {
      if (isDemoMode) {
        setLeads(mockLeads);
        setCampaigns([]);
        setLoading(false);
        return;
      }

      const workspace = await getWorkspace();

      if (workspace.error || !workspace.supabase || !workspace.organizationId) {
        setMessage(`${workspace.error} Showing demo assistant context.`);
        setLeads(mockLeads);
        setCampaigns([]);
        setLoading(false);
        return;
      }

      const [leadResult, campaignResult] = await Promise.all([
        workspace.supabase
          .from("leads")
          .select("id,name,company,role,email,score,status")
          .eq("organization_id", workspace.organizationId)
          .order("created_at", { ascending: false }),
        workspace.supabase
          .from("campaigns")
          .select("id,name,audience,status,steps")
          .eq("organization_id", workspace.organizationId)
          .order("created_at", { ascending: false }),
      ]);

      if (leadResult.error) {
        setMessage(`${leadResult.error.message}. Showing demo assistant context.`);
        setLeads(mockLeads);
      } else {
        setLeads(leadResult.data?.length ? leadResult.data : mockLeads);
      }

      if (!campaignResult.error) {
        setCampaigns(campaignResult.data || []);
      }

      setLoading(false);
    }

    loadWorkspaceContext();
  }, []);

  const overview = useMemo(() => {
    const companies = buildCompanySummary(leads);
    const averageScore = leads.length
      ? Math.round(leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length)
      : 0;

    return {
      leads: leads.length,
      companies: companies.length,
      campaigns: campaigns.length,
      averageScore,
      hotLeads: leads.filter((lead) => lead.status === "Hot").length,
      qualifiedLeads: leads.filter((lead) => lead.status === "Qualified").length,
    };
  }, [leads, campaigns]);

  function handleAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!question.trim()) return;

    const userQuestion = question.trim();
    const response = answerFromContext(userQuestion, leads, campaigns);

    setMessages((current) => [
      ...current,
      { role: "user", content: userQuestion },
      { role: "assistant", content: response },
    ]);
    setQuestion("");
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ Intelligence</p>
        <h1 className="mt-2 text-3xl font-bold">AI Assistant</h1>
        <p className="mt-2 text-slate-400">
          Ask questions against your live workspace context: leads, accounts, campaigns, and pipeline.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 text-sm text-blue-100">
          {message}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400">Leads</p>
          <p className="mt-2 text-2xl font-bold">{loading ? "..." : overview.leads}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400">Companies</p>
          <p className="mt-2 text-2xl font-bold">{loading ? "..." : overview.companies}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400">Campaigns</p>
          <p className="mt-2 text-2xl font-bold">{loading ? "..." : overview.campaigns}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400">Avg Score</p>
          <p className="mt-2 text-2xl font-bold">{loading ? "..." : overview.averageScore}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400">Hot</p>
          <p className="mt-2 text-2xl font-bold">{loading ? "..." : overview.hotLeads}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400">Qualified</p>
          <p className="mt-2 text-2xl font-bold">{loading ? "..." : overview.qualifiedLeads}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Workspace Assistant</h2>
            <p className="mt-1 text-sm text-slate-400">
              Responses are generated from your current Supabase workspace data.
            </p>
          </div>

          <div className="mb-5 max-h-[520px] space-y-4 overflow-y-auto rounded-xl border border-white/10 bg-slate-950 p-4">
            {messages.map((chatMessage, index) => (
              <div
                key={`${chatMessage.role}-${index}`}
                className={`rounded-xl p-4 text-sm ${
                  chatMessage.role === "assistant"
                    ? "bg-white/5 text-slate-200"
                    : "ml-auto max-w-[85%] bg-blue-500 text-white"
                }`}
              >
                <pre className="whitespace-pre-wrap font-sans">{chatMessage.content}</pre>
              </div>
            ))}
          </div>

          <form onSubmit={handleAsk} className="flex flex-col gap-3 md:flex-row">
            <input
              className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="Ask: Which leads should I contact first?"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />

            <button className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-medium text-white">
              Ask Assistant
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold">Suggested Questions</h2>

          <div className="mt-4 space-y-3">
            {[
              "Which leads should I contact first?",
              "Which companies are strongest?",
              "Summarize my pipeline",
              "What campaign should I run next?",
              "Give me a workspace overview",
            ].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setQuestion(sample)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-left text-sm text-slate-300 hover:border-blue-400/40"
              >
                {sample}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
            This assistant currently uses deterministic workspace intelligence. A true LLM route can be added next with OpenAI/Zhipu server-side keys.
          </div>
        </div>
      </div>
    </div>
  );
}
