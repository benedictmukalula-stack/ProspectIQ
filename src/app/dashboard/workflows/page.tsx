"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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

type Workflow = {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: string;
  last_run: string | null;
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

const mockWorkflows: Workflow[] = [
  {
    id: "demo-1",
    name: "Create follow-ups for Hot leads",
    trigger: "Lead status becomes Hot",
    action: "Create follow-up task",
    status: "Active",
    last_run: null,
  },
];

const emptyForm = {
  name: "",
  trigger: "Lead status becomes Hot",
  action: "Create follow-up task",
  status: "Active",
};

export default function WorkflowsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(!isDemoMode);
  const [saving, setSaving] = useState(false);
  const [runningWorkflowId, setRunningWorkflowId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function getWorkspace() {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      return {
        supabase: null,
        userId: null,
        organizationId: null,
        error: "Supabase unavailable.",
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
    async function loadWorkflowContext() {
      if (isDemoMode) {
        setLoading(false);
        return;
      }

      const workspace = await getWorkspace();

      if (workspace.error || !workspace.supabase || !workspace.organizationId) {
        setMessage(`${workspace.error} Showing demo workflows.`);
        setLoading(false);
        return;
      }

      const [leadResult, workflowResult] = await Promise.all([
        workspace.supabase
          .from("leads")
          .select("id,name,company,role,email,score,status")
          .eq("organization_id", workspace.organizationId)
          .order("created_at", { ascending: false }),
        workspace.supabase
          .from("workflows")
          .select("id,name,trigger,action,status,last_run")
          .eq("organization_id", workspace.organizationId)
          .order("created_at", { ascending: false }),
      ]);

      if (!leadResult.error) {
        setLeads(leadResult.data?.length ? leadResult.data : mockLeads);
      }

      if (!workflowResult.error) {
        setWorkflows(workflowResult.data?.length ? workflowResult.data : mockWorkflows);
      }

      setMessage("Loaded workflow context from workspace.");
      setLoading(false);
    }

    loadWorkflowContext();
  }, []);

  const automationStats = useMemo(() => {
    return {
      active: workflows.filter((workflow) => workflow.status === "Active").length,
      hotLeads: leads.filter((lead) => lead.status === "Hot").length,
      qualifiedLeads: leads.filter((lead) => lead.status === "Qualified").length,
      leadsWithEmail: leads.filter((lead) => Boolean(lead.email)).length,
    };
  }, [workflows, leads]);

  async function createWorkflow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    if (!form.name.trim()) {
      setMessage("Workflow name is required.");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      trigger: form.trigger,
      action: form.action,
      status: form.status,
      last_run: null,
    };

    if (isDemoMode) {
      setWorkflows((current) => [
        {
          id: crypto.randomUUID(),
          ...payload,
        },
        ...current,
      ]);
      setForm(emptyForm);
      setMessage("Demo workflow created locally.");
      setSaving(false);
      return;
    }

    const workspace = await getWorkspace();

    if (workspace.error || !workspace.supabase || !workspace.organizationId || !workspace.userId) {
      setMessage(`${workspace.error} Workflow was not saved.`);
      setSaving(false);
      return;
    }

    const result = await workspace.supabase
      .from("workflows")
      .insert({
        ...payload,
        organization_id: workspace.organizationId,
        created_by: workspace.userId,
      })
      .select("id,name,trigger,action,status,last_run")
      .single();

    if (result.error) {
      setMessage(result.error.message);
      setSaving(false);
      return;
    }

    setWorkflows((current) => [result.data, ...current]);
    setForm(emptyForm);
    setMessage("Workflow saved to Supabase.");
    setSaving(false);
  }

  async function runWorkflow(workflow: Workflow) {
    setRunningWorkflowId(workflow.id);
    setMessage("");

    const targetLeads =
      workflow.trigger === "Lead status becomes Hot"
        ? leads.filter((lead) => lead.status === "Hot")
        : workflow.trigger === "Lead score above 80"
          ? leads.filter((lead) => lead.score >= 80)
          : workflow.trigger === "Lead has email"
            ? leads.filter((lead) => Boolean(lead.email))
            : leads;

    if (targetLeads.length === 0) {
      setMessage("No matching leads found for this workflow.");
      setRunningWorkflowId(null);
      return;
    }

    if (isDemoMode) {
      setWorkflows((current) =>
        current.map((item) =>
          item.id === workflow.id ? { ...item, last_run: new Date().toISOString() } : item
        )
      );
      setMessage(`Demo workflow ran for ${targetLeads.length} matching lead(s).`);
      setRunningWorkflowId(null);
      return;
    }

    const workspace = await getWorkspace();

    if (workspace.error || !workspace.supabase || !workspace.organizationId || !workspace.userId) {
      setMessage(`${workspace.error} Workflow did not run.`);
      setRunningWorkflowId(null);
      return;
    }

    if (workflow.action === "Create follow-up task") {
      const taskRows = targetLeads.map((lead) => ({
        organization_id: workspace.organizationId,
        created_by: workspace.userId,
        title: `Follow up with ${lead.name} at ${lead.company}`,
        type: "Follow-up",
        priority: lead.status === "Hot" || lead.score >= 85 ? "High" : "Medium",
        status: "Open",
        due_date: null,
        notes: `Auto-created by workflow: ${workflow.name}`,
      }));

      await workspace.supabase.from("tasks").insert(taskRows);
    }

    if (workflow.action === "Mark as Contacted") {
      await workspace.supabase
        .from("leads")
        .update({ status: "Contacted" })
        .in(
          "id",
          targetLeads.map((lead) => lead.id)
        )
        .eq("organization_id", workspace.organizationId);

      setLeads((current) =>
        current.map((lead) =>
          targetLeads.some((target) => target.id === lead.id)
            ? { ...lead, status: "Contacted" }
            : lead
        )
      );
    }

    if (workflow.action === "Create notification") {
      const notificationTasks = targetLeads.map((lead) => ({
        organization_id: workspace.organizationId,
        created_by: workspace.userId,
        title: `Review high-value lead: ${lead.name}`,
        type: "Research",
        priority: "High",
        status: "Open",
        due_date: null,
        notes: `Workflow notification for ${lead.company}. Score: ${lead.score}.`,
      }));

      await workspace.supabase.from("tasks").insert(notificationTasks);
    }

    const lastRun = new Date().toISOString();

    await workspace.supabase
      .from("workflows")
      .update({ last_run: lastRun })
      .eq("id", workflow.id)
      .eq("organization_id", workspace.organizationId);

    setWorkflows((current) =>
      current.map((item) =>
        item.id === workflow.id ? { ...item, last_run: lastRun } : item
      )
    );

    setMessage(`Workflow ran successfully for ${targetLeads.length} lead(s).`);
    setRunningWorkflowId(null);
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ Automation</p>
        <h1 className="mt-2 text-3xl font-bold">Workflow Automation Engine</h1>
        <p className="mt-2 text-slate-400">
          Create safe automation rules for follow-ups, lead updates, notifications, and sales workflows.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 text-sm text-blue-100">
          {message}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Workflows</p>
          <p className="mt-3 text-3xl font-bold">{loading ? "..." : workflows.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Active</p>
          <p className="mt-3 text-3xl font-bold">{loading ? "..." : automationStats.active}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Hot Leads</p>
          <p className="mt-3 text-3xl font-bold">{loading ? "..." : automationStats.hotLeads}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Leads with Email</p>
          <p className="mt-3 text-3xl font-bold">{loading ? "..." : automationStats.leadsWithEmail}</p>
        </div>
      </div>

      <form onSubmit={createWorkflow} className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-5 text-lg font-semibold">Create Workflow</h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            placeholder="Workflow name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />

          <select
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            value={form.trigger}
            onChange={(event) => setForm({ ...form, trigger: event.target.value })}
          >
            <option>Lead status becomes Hot</option>
            <option>Lead score above 80</option>
            <option>Lead has email</option>
            <option>Any lead</option>
          </select>

          <select
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            value={form.action}
            onChange={(event) => setForm({ ...form, action: event.target.value })}
          >
            <option>Create follow-up task</option>
            <option>Create notification</option>
            <option>Mark as Contacted</option>
          </select>

          <select
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value })}
          >
            <option>Active</option>
            <option>Paused</option>
          </select>
        </div>

        <button
          disabled={saving}
          className="mt-5 rounded-xl bg-blue-500 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "Saving Workflow..." : "Create Workflow"}
        </button>
      </form>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Automation Rules</h2>
          <span className="text-sm text-slate-400">{workflows.length} workflows</span>
        </div>

        <div className="space-y-4">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="rounded-xl border border-white/10 bg-slate-950 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="font-semibold text-white">{workflow.name}</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    When: {workflow.trigger}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Then: {workflow.action}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Last run: {workflow.last_run ? new Date(workflow.last_run).toLocaleString() : "Never"}
                  </p>
                </div>

                <div className="flex flex-col gap-2 md:flex-row">
                  <span className="rounded-full bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300">
                    {workflow.status}
                  </span>

                  <button
                    type="button"
                    disabled={workflow.status !== "Active" || runningWorkflowId === workflow.id}
                    onClick={() => runWorkflow(workflow)}
                    className="rounded-lg border border-blue-400/30 px-4 py-2 text-sm text-blue-300 hover:bg-blue-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {runningWorkflowId === workflow.id ? "Running..." : "Run Now"}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {workflows.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
              No workflows yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
