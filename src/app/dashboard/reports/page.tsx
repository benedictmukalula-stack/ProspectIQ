"use client";

import { useEffect, useMemo, useState } from "react";
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

      setMessage("Loaded report data from workspace.");
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

      return [
        company,
        contacts.length,
        averageScore,
        contacts.filter((lead) => lead.status === "Hot").length,
        contacts.filter((lead) => lead.status === "Qualified").length,
      ];
    });
  }, [leads]);

  const pipelineRows = useMemo(() => {
    return stages.map((stage) => [
      stage,
      leads.filter((lead) => lead.status === stage).length,
    ]);
  }, [leads]);

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
      ...companyRows,
    ]);
  }

  function exportPipeline() {
    downloadCsv("prospectiq-pipeline.csv", [
      ["Stage", "Lead Count"],
      ...pipelineRows,
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
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ Reports</p>
        <h1 className="mt-2 text-3xl font-bold">Reporting Exports</h1>
        <p className="mt-2 text-slate-400">
          Export workspace CRM intelligence into CSV files for sharing, analysis, and reporting.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 text-sm text-blue-100">
          {message}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Leads</p>
          <p className="mt-3 text-3xl font-bold">{loading ? "..." : leads.length}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Companies</p>
          <p className="mt-3 text-3xl font-bold">{loading ? "..." : companyRows.length}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Campaigns</p>
          <p className="mt-3 text-3xl font-bold">{loading ? "..." : campaigns.length}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Pipeline Stages</p>
          <p className="mt-3 text-3xl font-bold">{loading ? "..." : stages.length}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {[
          {
            title: "Leads Export",
            description: "Download all CRM leads with contact details, scores, and statuses.",
            action: exportLeads,
            count: `${leads.length} rows`,
          },
          {
            title: "Companies Export",
            description: "Download account-level summaries grouped from lead data.",
            action: exportCompanies,
            count: `${companyRows.length} rows`,
          },
          {
            title: "Pipeline Export",
            description: "Download lead counts by CRM pipeline stage.",
            action: exportPipeline,
            count: `${pipelineRows.length} rows`,
          },
          {
            title: "Campaigns Export",
            description: "Download campaign library summaries.",
            action: exportCampaigns,
            count: `${campaigns.length} rows`,
          },
        ].map((report) => (
          <div key={report.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">{report.title}</h2>
                <p className="mt-2 text-sm text-slate-400">{report.description}</p>
                <p className="mt-3 text-xs text-slate-500">{report.count}</p>
              </div>

              <button
                type="button"
                onClick={report.action}
                className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white"
              >
                Download CSV
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
