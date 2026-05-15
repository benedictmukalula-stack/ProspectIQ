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

type CompanyProfile = {
  company: string;
  leadCount: number;
  averageScore: number;
  hotCount: number;
  qualifiedCount: number;
  contacts: Lead[];
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

function enrichCompany(company: CompanyProfile) {
  const name = company.company.toLowerCase();
  const signals: string[] = [];

  if (
    name.includes("freight") ||
    name.includes("cargo") ||
    name.includes("logistics") ||
    name.includes("trade") ||
    name.includes("export")
  ) {
    signals.push("Strong logistics or trade relevance detected.");
  }

  if (company.averageScore >= 85) {
    signals.push("High average buying-fit score.");
  } else if (company.averageScore >= 70) {
    signals.push("Good commercial fit with room for qualification.");
  } else {
    signals.push("Needs additional qualification before priority outreach.");
  }

  if (company.leadCount > 1) {
    signals.push("Multiple contacts available inside this account.");
  } else {
    signals.push("Single-contact account; identify more decision makers.");
  }

  if (company.hotCount > 0 || company.qualifiedCount > 0) {
    signals.push("Prioritize account-based follow-up.");
  }

  return signals;
}

export default function CompaniesPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [loading, setLoading] = useState(!isDemoMode);
  const [message, setMessage] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [insights, setInsights] = useState<string[]>([]);

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
    async function loadCompanies() {
      if (isDemoMode) {
        setLeads(mockLeads);
        setLoading(false);
        return;
      }

      const workspace = await getWorkspace();

      if (workspace.error || !workspace.supabase || !workspace.organizationId) {
        setMessage(`${workspace.error} Showing demo company data.`);
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
        setMessage(`${result.error.message}. Showing demo company data.`);
        setLeads(mockLeads);
        setLoading(false);
        return;
      }

      setLeads(result.data?.length ? result.data : mockLeads);
      setMessage(
        result.data?.length
          ? "Loaded live company intelligence from Supabase leads."
          : "No live leads yet. Showing demo company data."
      );
      setLoading(false);
    }

    loadCompanies();
  }, []);

  const companies = useMemo<CompanyProfile[]>(() => {
    const grouped = leads.reduce<Record<string, Lead[]>>((groups, lead) => {
      const companyName = lead.company || "Unknown Company";
      groups[companyName] = groups[companyName] || [];
      groups[companyName].push(lead);
      return groups;
    }, {});

    return Object.entries(grouped)
      .map(([company, contacts]) => {
        const totalScore = contacts.reduce((sum, lead) => sum + lead.score, 0);

        return {
          company,
          contacts,
          leadCount: contacts.length,
          averageScore: Math.round(totalScore / contacts.length),
          hotCount: contacts.filter((lead) => lead.status === "Hot").length,
          qualifiedCount: contacts.filter((lead) => lead.status === "Qualified").length,
        };
      })
      .sort((a, b) => b.averageScore - a.averageScore);
  }, [leads]);

  function handleEnrich(company: CompanyProfile) {
    setSelectedCompany(company.company);
    setInsights(enrichCompany(company));
    setMessage(`Generated enrichment insights for ${company.company}.`);
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ Accounts</p>
        <h1 className="mt-2 text-3xl font-bold">Company Enrichment</h1>
        <p className="mt-2 text-slate-400">
          Turn CRM leads into account-level intelligence and prioritization signals.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 text-sm text-blue-100">
          {message}
        </div>
      )}

      {insights.length > 0 && (
        <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-sm text-emerald-100">
          <p className="mb-2 font-semibold">Enrichment insights: {selectedCompany}</p>
          <ul className="list-disc space-y-1 pl-5">
            {insights.map((insight) => (
              <li key={insight}>{insight}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Companies</p>
          <p className="mt-3 text-3xl font-bold">{loading ? "..." : companies.length}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Total Contacts</p>
          <p className="mt-3 text-3xl font-bold">{loading ? "..." : leads.length}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Hot Accounts</p>
          <p className="mt-3 text-3xl font-bold">
            {loading ? "..." : companies.filter((company) => company.hotCount > 0).length}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Avg Account Score</p>
          <p className="mt-3 text-3xl font-bold">
            {loading
              ? "..."
              : companies.length
                ? Math.round(
                    companies.reduce((sum, company) => sum + company.averageScore, 0) /
                      companies.length
                  )
                : 0}
          </p>
        </div>
      </div>

      <div className="grid gap-5">
        {companies.map((company) => (
          <div key={company.company} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">{company.company}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {company.leadCount} contact{company.leadCount === 1 ? "" : "s"} · Avg score{" "}
                  {company.averageScore}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                  Score {company.averageScore}
                </span>
                <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-300">
                  Hot {company.hotCount}
                </span>
                <span className="rounded-full bg-purple-400/10 px-3 py-1 text-xs text-purple-300">
                  Qualified {company.qualifiedCount}
                </span>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="py-3">Contact</th>
                    <th className="py-3">Role</th>
                    <th className="py-3">Email</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Score</th>
                  </tr>
                </thead>

                <tbody>
                  {company.contacts.map((lead) => (
                    <tr key={lead.id} className="border-t border-white/10 text-slate-300">
                      <td className="py-4 font-medium text-white">{lead.name}</td>
                      <td className="py-4">{lead.role || "—"}</td>
                      <td className="py-4">{lead.email || "—"}</td>
                      <td className="py-4">{lead.status}</td>
                      <td className="py-4">{lead.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={() => handleEnrich(company)}
              className="mt-5 rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white"
            >
              Enrich Company
            </button>
          </div>
        ))}

        {companies.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
            No company data yet. Add leads first to generate company intelligence.
          </div>
        )}
      </div>
    </div>
  );
}
