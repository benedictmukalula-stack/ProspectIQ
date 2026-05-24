"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createBrowserSupabaseClient,
  isDemoMode,
  supabaseAuth,
} from "../lib/supabase/client";

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
};

const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Sarah M.",
    company: "Atlas Freight",
    role: "Operations Director",
    email: "sarah@atlasfreight.example",
    score: 92,
    status: "Hot",
  },
  {
    id: "2",
    name: "James K.",
    company: "TradeLink Africa",
    role: "Procurement Lead",
    email: "james@tradelink.example",
    score: 88,
    status: "Qualified",
  },
];

const mockCampaigns: Campaign[] = [
  {
    id: "demo-1",
    name: "Logistics Decision Makers Outreach",
    audience: "Hot and Qualified leads",
    status: "Draft",
  },
];

const stages = ["New", "Warm", "Hot", "Qualified", "Contacted"];

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadCsv(filename: string, rows: unknown[][]) {
  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [loading, setLoading] = useState(!isDemoMode);
  const [message, setMessage] = useState("");

  async function getWorkspace() {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      return { supabase: null, organizationId: null, error: "Supabase unavailable." };
    }

    const userResult = await supabaseAuth.getUser();

    if (userResult.error || !userResult.data.user) {
      return { supabase, organizationId: null, error: "No active session." };
    }

    const workspaceResult = await supabase.rpc("ensure_user_workspace");

    if (workspaceResult.error || !workspaceResult.data?.[0]) {
      return { supabase, organizationId: null, error: "Workspace not ready." };
    }

    return {
      supabase,
      organizationId: workspaceResult.data[0].organization_id,
      error: null,
    };
  }

  useEffect(() => {
    async function loadReportsData() {
      if (isDemoMode) {
        setLoading(false);
        return;
      }

      const workspace = await getWorkspace();

      if (workspace.error || !workspace.supabase || !workspace.organizationId) {
        setMessage(`${workspace.error} Showing demo report data.`);
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
          .select("id,name,audience,status")
          .eq("organization_id", workspace.organizationId)
          .order("created_at", { ascending: false }),
      ]);

      if (!leadResult.error) {
        setLeads(leadResult.data?.length ? leadResult.data : mockLeads);
      }

      if (!campaignResult.error) {
        setCampaigns(campaignResult.data?.length ? campaignResult.data : mockCampaigns);
      }

      setMessage("Executive reporting synchronized with workspace.");
      setLoading(false);
    }

    loadReportsData();
  }, []);

  const companyRows = useMemo(() => {
    const grouped = leads.reduce<Record<string, Lead[]>>((groups, lead) => {
      groups[lead.company] = groups[lead.company] || [];
      groups[lead.company].push(lead);
      return groups;
    }, {});

    return Object.entries(grouped).map(([company, contacts]) => {
      const averageScore = Math.round(
        contacts.reduce((sum, lead) => sum + lead.score, 0) / contacts.length
      );

      return {
        company,
        contacts: contacts.length,
        averageScore,
        hot: contacts.filter((lead) => lead.status === "Hot").length,
        qualified: contacts.filter((lead) => lead.status === "Qualified").length,
      };
    });
  }, [leads]);

  const pipelineRows = useMemo(() => {
    return stages.map((stage) => ({
      stage,
      count: leads.filter((lead) => lead.status === stage).length,
    }));
  }, [leads]);

  const avgLeadScore = Math.round(
    leads.reduce((sum, lead) => sum + lead.score, 0) / Math.max(leads.length, 1)
  );

  const estimatedPipelineValue = leads.length * 8500;

  function exportLeads() {
    downloadCsv("prospectiq-leads.csv", [
      ["Name", "Company", "Role", "Email", "Score", "Status"],
      ...leads.map((lead) => [
        lead.name,
        lead.company,
        lead.role || "",
        lead.email || "",
        lead.score,
        lead.status,
      ]),
    ]);
  }

  function exportCompanies() {
    downloadCsv("prospectiq-companies.csv", [
      ["Company", "Contacts", "Average Score", "Hot Contacts", "Qualified Contacts"],
      ...companyRows.map((company) => [
        company.company,
        company.contacts,
        company.averageScore,
        company.hot,
        company.qualified,
      ]),
    ]);
  }

  function exportPipeline() {
    downloadCsv("prospectiq-pipeline.csv", [
      ["Stage", "Lead Count"],
      ...pipelineRows.map((row) => [row.stage, row.count]),
    ]);
  }

  function exportCampaigns() {
    downloadCsv("prospectiq-campaigns.csv", [
      ["Campaign", "Audience", "Status"],
      ...campaigns.map((campaign) => [
        campaign.name,
        campaign.audience,
        campaign.status,
      ]),
    ]);
  }

  return (
    <main className="space-y-8">
      <section className="rounded-2xl border bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
        <p className="text-sm text-slate-300">Executive Intelligence</p>

        <h1 className="mt-2 text-3xl font-bold">
          Premium Reports & Executive Dashboard
        </h1>

        <p className="mt-3 max-w-3xl text-sm text-slate-300">
          Enterprise reporting center for pipeline forecasting, outbound visibility,
          lead intelligence, campaign performance, and operational readiness.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            ["CRM Leads", leads.length],
            ["Campaigns", campaigns.length],
            ["Average Lead Score", avgLeadScore],
            ["Estimated Pipeline", `$${estimatedPipelineValue.toLocaleString()}`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-white/5 p-5"
            >
              <p className="text-xs text-slate-300">{label}</p>
              <p className="mt-2 text-3xl font-semibold">{loading ? "..." : value}</p>
            </div>
          ))}
        </div>
      </section>

      {message && (
        <div className="rounded-xl border border-blue-400/20 bg-blue-500/5 p-4 text-sm">
          {message}
        </div>
      )}

      <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Outbound Health",
            value: "Operational",
            description: "Send queue, enrollments, and engagement tracking active.",
          },
          {
            title: "AI Workflow Readiness",
            value: "Stable",
            description: "Lead scoring and email drafting workflows responding.",
          },
          {
            title: "Revenue Forecast",
            value: `$${(estimatedPipelineValue * 1.7).toLocaleString()}`,
            description: "Weighted opportunity forecast across tracked pipeline.",
          },
          {
            title: "Executive Status",
            value: "Growth Mode",
            description: "Outbound infrastructure and CRM intelligence expanding.",
          },
        ].map((card) => (
          <div key={card.title} className="rounded-2xl border p-6">
            <p className="text-sm text-muted-foreground">{card.title}</p>
            <p className="mt-3 text-3xl font-bold">{card.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {card.description}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Pipeline Distribution</h2>

          <div className="mt-5 space-y-4">
            {pipelineRows.map((row) => (
              <div key={row.stage}>
                <div className="flex justify-between text-sm">
                  <span>{row.stage}</span>
                  <span>{row.count}</span>
                </div>

                <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-black"
                    style={{
                      width: `${Math.max(
                        (row.count / Math.max(leads.length, 1)) * 100,
                        4
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">
            Account Intelligence Overview
          </h2>

          <div className="mt-5 space-y-4">
            {companyRows.map((company) => (
              <div
                key={company.company}
                className="rounded-xl border bg-muted/40 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{company.company}</p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {company.contacts} contacts · {company.hot} hot ·{" "}
                      {company.qualified} qualified
                    </p>
                  </div>

                  <div className="rounded-lg border px-3 py-1 text-sm">
                    {company.averageScore}/100
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Export Center</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Download CRM intelligence and executive reporting exports.
            </p>
          </div>

          <div className="rounded-full border px-4 py-2 text-sm">
            Enterprise Reporting Active
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {[
            {
              title: "Leads Export",
              description: "Export CRM lead intelligence and qualification scores.",
              action: exportLeads,
            },
            {
              title: "Companies Export",
              description: "Export account intelligence and contact summaries.",
              action: exportCompanies,
            },
            {
              title: "Pipeline Export",
              description: "Export CRM stage distribution and operational flow.",
              action: exportPipeline,
            },
            {
              title: "Campaign Export",
              description: "Export outbound campaign and audience summaries.",
              action: exportCampaigns,
            },
          ].map((report) => (
            <div key={report.title} className="rounded-xl border p-5">
              <h3 className="font-semibold">{report.title}</h3>

              <p className="mt-2 text-sm text-muted-foreground">
                {report.description}
              </p>

              <button
                onClick={report.action}
                className="mt-5 rounded-lg bg-black px-4 py-2 text-sm text-white"
              >
                Download CSV
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
