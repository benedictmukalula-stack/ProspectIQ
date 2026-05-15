"use client";

import { DragEvent, useEffect, useMemo, useState } from "react";
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

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [loading, setLoading] = useState(!isDemoMode);
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);
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
    async function loadLeads() {
      if (isDemoMode) {
        setLeads(mockLeads);
        setLoading(false);
        return;
      }

      const workspace = await getWorkspace();

      if (workspace.error || !workspace.supabase || !workspace.organizationId) {
        setMessage(`${workspace.error} Showing mock pipeline.`);
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
          ? "Loaded live pipeline from Supabase."
          : "No live leads yet. Showing starter examples."
      );
      setLoading(false);
    }

    loadLeads();
  }, []);

  const groupedLeads = useMemo(() => {
    return stages.reduce<Record<string, Lead[]>>((groups, stage) => {
      groups[stage] = leads.filter((lead) => lead.status === stage);
      return groups;
    }, {});
  }, [leads]);

  async function moveLead(leadId: string, nextStatus: string) {
    const currentLead = leads.find((lead) => lead.id === leadId);

    if (!currentLead || currentLead.status === nextStatus) {
      setDraggingLeadId(null);
      return;
    }

    const previousLeads = leads;

    setLeads((current) =>
      current.map((lead) =>
        lead.id === leadId ? { ...lead, status: nextStatus } : lead
      )
    );

    setDraggingLeadId(null);

    if (isDemoMode) {
      setMessage(`Moved ${currentLead.name} to ${nextStatus}.`);
      return;
    }

    const workspace = await getWorkspace();

    if (workspace.error || !workspace.supabase || !workspace.organizationId) {
      setLeads(previousLeads);
      setMessage(`${workspace.error} Pipeline update was not saved.`);
      return;
    }

    const result = await workspace.supabase
      .from("leads")
      .update({ status: nextStatus })
      .eq("id", leadId)
      .eq("organization_id", workspace.organizationId);

    if (result.error) {
      setLeads(previousLeads);
      setMessage(result.error.message);
      return;
    }

    setMessage(`Moved ${currentLead.name} to ${nextStatus}.`);
  }

  function handleDragStart(event: DragEvent<HTMLDivElement>, leadId: string) {
    setDraggingLeadId(leadId);
    event.dataTransfer.setData("text/plain", leadId);
    event.dataTransfer.effectAllowed = "move";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>, stage: string) {
    event.preventDefault();
    const leadId = event.dataTransfer.getData("text/plain") || draggingLeadId;
    if (leadId) moveLead(leadId, stage);
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ CRM</p>
        <h1 className="mt-2 text-3xl font-bold">CRM Pipeline</h1>
        <p className="mt-2 text-slate-400">
          Drag leads between stages to update their live Supabase status.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 text-sm text-blue-100">
          {message}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-5">
        {stages.map((stage) => (
          <div key={stage} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-400">{stage}</p>
            <p className="mt-2 text-2xl font-bold">{groupedLeads[stage]?.length || 0}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[1100px] grid-cols-5 gap-4">
          {stages.map((stage) => (
            <div
              key={stage}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, stage)}
              className="min-h-[480px] rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">{stage}</h2>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-400">
                  {groupedLeads[stage]?.length || 0}
                </span>
              </div>

              <div className="space-y-3">
                {loading && (
                  <div className="rounded-xl border border-white/10 bg-slate-950 p-4 text-sm text-slate-400">
                    Loading pipeline...
                  </div>
                )}

                {!loading &&
                  groupedLeads[stage]?.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(event) => handleDragStart(event, lead.id)}
                      onDragEnd={() => setDraggingLeadId(null)}
                      className={`cursor-grab rounded-xl border border-white/10 bg-slate-950 p-4 shadow-sm transition hover:border-blue-400/40 ${
                        draggingLeadId === lead.id ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-white">{lead.name}</h3>
                          <p className="mt-1 text-sm text-slate-400">{lead.company}</p>
                        </div>

                        <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300">
                          {lead.score}
                        </span>
                      </div>

                      <div className="mt-4 space-y-1 text-xs text-slate-500">
                        <p>{lead.role || "No role captured"}</p>
                        <p>{lead.email || "No email captured"}</p>
                      </div>
                    </div>
                  ))}

                {!loading && groupedLeads[stage]?.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-sm text-slate-500">
                    Drop leads here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
