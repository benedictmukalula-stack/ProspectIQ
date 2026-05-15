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

function leadToForm(lead: Lead): LeadForm {
  return {
    name: lead.name,
    company: lead.company,
    role: lead.role || "",
    email: lead.email || "",
    score: String(lead.score),
    status: lead.status,
  };
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [form, setForm] = useState<LeadForm>(emptyForm);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isDemoMode);
  const [saving, setSaving] = useState(false);
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function getWorkspace() {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      return {
        supabase: null,
        userId: null,
        organizationId: null,
        error: "Supabase client unavailable.",
      };
    }

    const userResult = await supabaseAuth.getUser();

    if (userResult.error || !userResult.data.user) {
      return {
        supabase,
        userId: null,
        organizationId: null,
        error: "No active session.",
      };
    }

    const workspaceResult = await supabase.rpc("ensure_user_workspace");

    if (workspaceResult.error || !workspaceResult.data?.[0]) {
      return {
        supabase,
        userId: userResult.data.user.id,
        organizationId: null,
        error: "Workspace not ready.",
      };
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
      setMessage(
        result.data?.length
          ? "Loaded live leads from Supabase."
          : "No live leads yet. Showing starter examples."
      );
      setLoading(false);
    }

    loadLeads();
  }, []);

  function validateForm() {
    const leadScore = Number(form.score);

    if (!form.name.trim() || !form.company.trim()) {
      return { valid: false, score: leadScore, error: "Name and company are required." };
    }

    if (Number.isNaN(leadScore) || leadScore < 0 || leadScore > 100) {
      return { valid: false, score: leadScore, error: "Score must be a number between 0 and 100." };
    }

    return { valid: true, score: leadScore, error: null };
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingLeadId(null);
  }

  function startEditing(lead: Lead) {
    setEditingLeadId(lead.id);
    setForm(leadToForm(lead));
    setMessage(`Editing ${lead.name}.`);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const validation = validateForm();

    if (!validation.valid) {
      setMessage(validation.error || "Invalid lead details.");
      setSaving(false);
      return;
    }

    const leadPayload = {
      name: form.name.trim(),
      company: form.company.trim(),
      role: form.role.trim() || null,
      email: form.email.trim() || null,
      score: validation.score,
      status: form.status,
    };

    if (editingLeadId) {
      await updateLead(leadPayload);
    } else {
      await createLead(leadPayload);
    }

    setSaving(false);
  }

  async function createLead(leadPayload: Omit<Lead, "id">) {
    if (isDemoMode) {
      const demoLead: Lead = {
        id: crypto.randomUUID(),
        ...leadPayload,
      };

      setLeads((current) => [demoLead, ...current]);
      resetForm();
      setMessage("Demo lead added locally.");
      return;
    }

    const workspace = await getWorkspace();

    if (workspace.error || !workspace.supabase || !workspace.organizationId || !workspace.userId) {
      setMessage(`${workspace.error} Lead was not saved.`);
      return;
    }

    const result = await workspace.supabase
      .from("leads")
      .insert({
        ...leadPayload,
        organization_id: workspace.organizationId,
        created_by: workspace.userId,
      })
      .select("id,name,company,role,email,score,status")
      .single();

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    setLeads((current) => [result.data, ...current]);
    resetForm();
    setMessage("Lead saved to Supabase.");
  }

  async function updateLead(leadPayload: Omit<Lead, "id">) {
    if (!editingLeadId) return;

    if (isDemoMode) {
      setLeads((current) =>
        current.map((lead) =>
          lead.id === editingLeadId ? { id: editingLeadId, ...leadPayload } : lead
        )
      );
      resetForm();
      setMessage("Demo lead updated locally.");
      return;
    }

    const workspace = await getWorkspace();

    if (workspace.error || !workspace.supabase || !workspace.organizationId) {
      setMessage(`${workspace.error} Lead was not updated.`);
      return;
    }

    const result = await workspace.supabase
      .from("leads")
      .update(leadPayload)
      .eq("id", editingLeadId)
      .eq("organization_id", workspace.organizationId)
      .select("id,name,company,role,email,score,status")
      .single();

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    setLeads((current) =>
      current.map((lead) => (lead.id === editingLeadId ? result.data : lead))
    );
    resetForm();
    setMessage("Lead updated in Supabase.");
  }

  async function deleteLead(lead: Lead) {
    const confirmed = window.confirm(`Delete ${lead.name} from ${lead.company}?`);
    if (!confirmed) return;

    setDeletingLeadId(lead.id);
    setMessage("");

    if (isDemoMode) {
      setLeads((current) => current.filter((item) => item.id !== lead.id));
      if (editingLeadId === lead.id) resetForm();
      setDeletingLeadId(null);
      setMessage("Demo lead deleted locally.");
      return;
    }

    const workspace = await getWorkspace();

    if (workspace.error || !workspace.supabase || !workspace.organizationId) {
      setMessage(`${workspace.error} Lead was not deleted.`);
      setDeletingLeadId(null);
      return;
    }

    const result = await workspace.supabase
      .from("leads")
      .delete()
      .eq("id", lead.id)
      .eq("organization_id", workspace.organizationId);

    if (result.error) {
      setMessage(result.error.message);
      setDeletingLeadId(null);
      return;
    }

    setLeads((current) => current.filter((item) => item.id !== lead.id));
    if (editingLeadId === lead.id) resetForm();
    setDeletingLeadId(null);
    setMessage("Lead deleted from Supabase.");
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ CRM</p>
        <h1 className="mt-2 text-3xl font-bold">Leads</h1>
        <p className="mt-2 text-slate-400">
          Lead management connected to Supabase with create, edit, and delete actions.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 text-sm text-blue-100">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {editingLeadId ? "Edit Lead" : "Add Lead"}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {editingLeadId
                ? "Update the selected prospect record."
                : "Create a new prospect and save it into the active workspace."}
            </p>
          </div>

          {editingLeadId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
            >
              Cancel Edit
            </button>
          )}
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
          {saving
            ? editingLeadId
              ? "Updating Lead..."
              : "Saving Lead..."
            : editingLeadId
              ? "Update Lead"
              : "Add Lead"}
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
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="py-3">Name</th>
                <th className="py-3">Company</th>
                <th className="py-3">Role</th>
                <th className="py-3">Email</th>
                <th className="py-3">Score</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Actions</th>
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
                  <td className="py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEditing(lead)}
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-200 hover:bg-white/5"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={deletingLeadId === lead.id}
                        onClick={() => deleteLead(lead)}
                        className="rounded-lg border border-red-400/30 px-3 py-2 text-xs text-red-300 hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingLeadId === lead.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {leads.length === 0 && (
                <tr className="border-t border-white/10 text-slate-400">
                  <td className="py-6 text-center" colSpan={7}>
                    No leads yet. Add your first lead above.
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
