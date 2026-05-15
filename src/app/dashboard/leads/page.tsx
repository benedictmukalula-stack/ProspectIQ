"use client";

import { FormEvent, useEffect, useState } from "react";
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

type LeadForm = {
  name: string;
  company: string;
  role: string;
  email: string;
  score: string;
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

const emptyForm: LeadForm = {
  name: "",
  company: "",
  role: "",
  email: "",
  score: "70",
  status: "New",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [form, setForm] = useState<LeadForm>(emptyForm);
  const [loading, setLoading] = useState(!isDemoMode);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function getWorkspace() {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      return { supabase: null, userId: null, organizationId: null, error: "Supabase client unavailable." };
    }

    const userResult = await supabaseAuth.getUser();

    if (userResult.error || !userResult.data.user) {
      return { supabase, userId: null, organizationId: null, error: "No active session." };
    }

    const workspaceResult = await supabase.rpc("ensure_user_workspace");

    if (workspaceResult.error || !workspaceResult.data?.[0]) {
      return { supabase, userId: userResult.data.user.id, organizationId: null, error: "Workspace not ready." };
    }

    return {
      supabase,
      userId: userResult.data.user.id,
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
        setMessage(`${workspace.error} Showing mock leads.`);
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
      setMessage(result.data?.length ? "Loaded live leads from Supabase." : "No live leads yet. Showing starter examples.");
      setLoading(false);
    }

    loadLeads();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const leadScore = Number(form.score);

    if (!form.name.trim() || !form.company.trim()) {
      setMessage("Name and company are required.");
      setSaving(false);
      return;
    }

    if (Number.isNaN(leadScore) || leadScore < 0 || leadScore > 100) {
      setMessage("Score must be a number between 0 and 100.");
      setSaving(false);
      return;
    }

    const newLeadPayload = {
      name: form.name.trim(),
      company: form.company.trim(),
      role: form.role.trim() || null,
      email: form.email.trim() || null,
      score: leadScore,
      status: form.status,
    };

    if (isDemoMode) {
      const demoLead: Lead = {
        id: crypto.randomUUID(),
        ...newLeadPayload,
      };

      setLeads((current) => [demoLead, ...current]);
      setForm(emptyForm);
      setMessage("Demo lead added locally.");
      setSaving(false);
      return;
    }

    const workspace = await getWorkspace();

    if (workspace.error || !workspace.supabase || !workspace.organizationId || !workspace.userId) {
      setMessage(`${workspace.error} Lead was not saved.`);
      setSaving(false);
      return;
    }

    const result = await workspace.supabase
      .from("leads")
      .insert({
        ...newLeadPayload,
        organization_id: workspace.organizationId,
        created_by: workspace.userId,
      })
      .select("id,name,company,role,email,score,status")
      .single();

    if (result.error) {
      setMessage(result.error.message);
      setSaving(false);
      return;
    }

    setLeads((current) => [result.data, ...current]);
    setForm(emptyForm);
    setMessage("Lead saved to Supabase.");
    setSaving(false);
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ CRM</p>
        <h1 className="mt-2 text-3xl font-bold">Leads</h1>
        <p className="mt-2 text-slate-400">
          Lead management connected to Supabase with a working create-lead form.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 text-sm text-blue-100">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Add Lead</h2>
          <p className="mt-1 text-sm text-slate-400">
            Create a new prospect and save it into the active workspace.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <input
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            placeholder="Lead name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />

          <input
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            placeholder="Company"
            value={form.company}
            onChange={(event) => setForm({ ...form, company: event.target.value })}
          />

          <input
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            placeholder="Role"
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value })}
          />

          <input
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />

          <input
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            placeholder="Score"
            type="number"
            min="0"
            max="100"
            value={form.score}
            onChange={(event) => setForm({ ...form, score: event.target.value })}
          />

          <select
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value })}
          >
            <option>New</option>
            <option>Warm</option>
            <option>Hot</option>
            <option>Qualified</option>
            <option>Contacted</option>
          </select>
        </div>

        <button
          disabled={saving}
          className="mt-5 rounded-xl bg-blue-500 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving Lead..." : "Add Lead"}
        </button>
      </form>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold">
            {loading ? "Loading leads..." : "Lead Database"}
          </h2>

          <span className="text-sm text-slate-400">{leads.length} leads</span>
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
