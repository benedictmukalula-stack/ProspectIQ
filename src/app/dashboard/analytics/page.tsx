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

const stages = ["New", "Warm", "Hot", "Qualified", "Contacted"];

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

export default function AnalyticsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
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
    async function loadAnalytics() {
      if (isDemoMode) {
        setLeads(mockLeads);
        setLoading(false);
        return;
      }

      const workspace = await getWorkspace();

      if (workspace.error || !workspace.supabase || !workspace.organizationId) {
        setMessage(`${workspace.error} Showing demo analytics.`);
        setLeads(mockLeads);
        setLoading(false);
        return;
      }

      const result = await workspace.supabase
        .from("leads")
        .select("id,name,company,role,email,score,status")
        .eq("organization_id", workspace.organizationId)
        .order("created_at", { ascending: false });

      if (result.error) {
        setMessage(result.error.message);
        setLeads(mockLeads);
        setLoading(false);
        return;
      }

      setLeads(result.data?.length ? result.data : mockLeads);
      setMessage(
        result.data?.length
          ? "Loaded live analytics from Supabase."
          : "No live leads yet. Showing demo analytics."
      );
      setLoading(false);
    }

    loadAnalytics();
  }, []);

  const analytics = useMemo(() => {
    const totalLeads = leads.length;
    const totalScore = leads.reduce((sum, lead) => sum + lead.score, 0);
    const averageScore = totalLeads ? Math.round(totalScore / totalLeads) : 0;
    const hotLeads = leads.filter((lead) => lead.status === "Hot").length;
    const qualifiedLeads = leads.filter((lead) => lead.status === "Qualified").length;
    const emailCoverage = totalLeads
      ? Math.round((leads.filter((lead) => Boolean(lead.email)).length / totalLeads) * 100)
      : 0;

    const statusCounts = stages.map((stage) => ({
      stage,
      count: leads.filter((lead) => lead.status === stage).length,
      percentage: totalLeads
        ? Math.round((leads.filter((lead) => lead.status === stage).length / totalLeads) * 100)
        : 0,
    }));

    const scoreBands = [
      {
        label: "80-100",
        count: leads.filter((lead) => lead.score >= 80).length,
      },
      {
        label: "60-79",
        count: leads.filter((lead) => lead.score >= 60 && lead.score < 80).length,
      },
      {
        label: "0-59",
        count: leads.filter((lead) => lead.score < 60).length,
      },
    ];

    const topLeads = [...leads].sort((a, b) => b.score - a.score).slice(0, 5);

    return {
      totalLeads,
      averageScore,
      hotLeads,
      qualifiedLeads,
      emailCoverage,
      statusCounts,
      scoreBands,
      topLeads,
    };
  }, [leads]);

  const maxStatusCount = Math.max(...analytics.statusCounts.map((item) => item.count), 1);
  const maxScoreBandCount = Math.max(...analytics.scoreBands.map((item) => item.count), 1);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ Intelligence</p>
        <h1 className="mt-2 text-3xl font-bold">Analytics</h1>
        <p className="mt-2 text-slate-400">
          Live lead intelligence generated from your Supabase CRM data.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 text-sm text-blue-100">
          {message}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Total Leads</p>
          <p className="mt-3 text-3xl font-bold">{loading ? "..." : analytics.totalLeads}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Average Score</p>
          <p className="mt-3 text-3xl font-bold">{loading ? "..." : analytics.averageScore}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Hot Leads</p>
          <p className="mt-3 text-3xl font-bold">{loading ? "..." : analytics.hotLeads}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Qualified</p>
          <p className="mt-3 text-3xl font-bold">{loading ? "..." : analytics.qualifiedLeads}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Email Coverage</p>
          <p className="mt-3 text-3xl font-bold">{loading ? "..." : `${analytics.emailCoverage}%`}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Pipeline Status Breakdown</h2>
            <p className="mt-1 text-sm text-slate-400">
              Distribution of leads across CRM stages.
            </p>
          </div>

          <div className="space-y-4">
            {analytics.statusCounts.map((item) => (
              <div key={item.stage}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-300">{item.stage}</span>
                  <span className="text-slate-400">
                    {item.count} leads · {item.percentage}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-900">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${(item.count / maxStatusCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Score Distribution</h2>
            <p className="mt-1 text-sm text-slate-400">
              Quality bands based on lead score.
            </p>
          </div>

          <div className="space-y-4">
            {analytics.scoreBands.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-300">{item.label}</span>
                  <span className="text-slate-400">{item.count} leads</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-900">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${(item.count / maxScoreBandCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Top Scored Leads</h2>
          <p className="mt-1 text-sm text-slate-400">
            Highest-value prospects ranked by score.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="py-3">Lead</th>
                <th className="py-3">Company</th>
                <th className="py-3">Role</th>
                <th className="py-3">Status</th>
                <th className="py-3">Score</th>
              </tr>
            </thead>

            <tbody>
              {analytics.topLeads.map((lead) => (
                <tr key={lead.id} className="border-t border-white/10 text-slate-300">
                  <td className="py-4 font-medium text-white">{lead.name}</td>
                  <td className="py-4">{lead.company}</td>
                  <td className="py-4">{lead.role || "—"}</td>
                  <td className="py-4">{lead.status}</td>
                  <td className="py-4">
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-300">
                      {lead.score}
                    </span>
                  </td>
                </tr>
              ))}

              {analytics.topLeads.length === 0 && (
                <tr className="border-t border-white/10 text-slate-400">
                  <td className="py-6 text-center" colSpan={5}>
                    No leads available for analytics yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
