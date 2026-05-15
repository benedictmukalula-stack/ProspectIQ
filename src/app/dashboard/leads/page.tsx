"use client";

import { useEffect, useState } from "react";
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

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [loading, setLoading] = useState(!isDemoMode);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadLeads() {
      if (isDemoMode) {
        setLeads(mockLeads);
        setLoading(false);
        return;
      }

      const supabase = createBrowserSupabaseClient();

      if (!supabase) {
        setMessage("Supabase client unavailable. Showing mock leads.");
        setLeads(mockLeads);
        setLoading(false);
        return;
      }

      const userResult = await supabaseAuth.getUser();

      if (userResult.error || !userResult.data.user) {
        setMessage("No active session. Showing mock leads.");
        setLeads(mockLeads);
        setLoading(false);
        return;
      }

      const workspaceResult = await supabase.rpc("ensure_user_workspace");

      if (workspaceResult.error || !workspaceResult.data?.[0]) {
        setMessage("Workspace not ready. Showing mock leads.");
        setLeads(mockLeads);
        setLoading(false);
        return;
      }

      const organizationId = workspaceResult.data[0].organization_id;

      const result = await supabase
        .from("leads")
        .select("id,name,company,role,email,score,status")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (result.error) {
        setMessage(result.error.message);
        setLeads(mockLeads);
        setLoading(false);
        return;
      }

      if (!result.data || result.data.length === 0) {
        const seedResult = await supabase
          .from("leads")
          .insert([
            {
              organization_id: organizationId,
              created_by: userResult.data.user.id,
              name: "Sarah M.",
              company: "Atlas Freight",
              role: "Operations Director",
              email: "sarah@atlasfreight.example",
              score: 92,
              status: "Warm",
            },
            {
              organization_id: organizationId,
              created_by: userResult.data.user.id,
              name: "James K.",
              company: "TradeLink Africa",
              role: "Procurement Lead",
              email: "james@tradelink.example",
              score: 88,
              status: "Hot",
            },
          ])
          .select("id,name,company,role,email,score,status");

        if (seedResult.error) {
          setMessage(seedResult.error.message);
          setLeads(mockLeads);
        } else {
          setLeads(seedResult.data || mockLeads);
          setMessage("Seeded starter leads into Supabase.");
        }

        setLoading(false);
        return;
      }

      setLeads(result.data);
      setMessage("Loaded live leads from Supabase.");
      setLoading(false);
    }

    loadLeads();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ CRM</p>
        <h1 className="mt-2 text-3xl font-bold">Leads</h1>
        <p className="mt-2 text-slate-400">
          Lead management connected to Supabase with mock fallback.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 text-sm text-blue-100">
          {message}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold">
            {loading ? "Loading leads..." : "Lead Database"}
          </h2>

          <button className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white">
            Add Lead — Coming Soon
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="py-3">Name</th>
                <th className="py-3">Company</th>
                <th className="py-3">Role</th>
                <th className="py-3">Email</th>
                <th className="py-3">Score</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-white/10 text-slate-300">
                  <td className="py-4 font-medium text-white">{lead.name}</td>
                  <td className="py-4">{lead.company}</td>
                  <td className="py-4">{lead.role || "—"}</td>
                  <td className="py-4">{lead.email || "—"}</td>
                  <td className="py-4">
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-300">
                      {lead.score}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="rounded-full bg-blue-400/10 px-3 py-1 text-blue-300">
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
