"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  createBrowserSupabaseClient,
  isDemoMode,
  supabaseAuth,
} from "@/lib/supabase/client";

type Task = {
  id: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  due_date: string | null;
  notes: string | null;
  created_at?: string;
};

const mockTasks: Task[] = [
  {
    id: "demo-1",
    title: "Follow up with Atlas Freight",
    type: "Follow-up",
    priority: "High",
    status: "Open",
    due_date: null,
    notes: "High-fit logistics prospect.",
  },
];

const emptyForm = {
  title: "",
  type: "Follow-up",
  priority: "Medium",
  status: "Open",
  due_date: "",
  notes: "",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(!isDemoMode);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function getWorkspace() {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) return { supabase: null, userId: null, organizationId: null, error: "Supabase unavailable." };

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
    async function loadTasks() {
      if (isDemoMode) {
        setTasks(mockTasks);
        setLoading(false);
        return;
      }

      const workspace = await getWorkspace();

      if (workspace.error || !workspace.supabase || !workspace.organizationId) {
        setMessage(`${workspace.error} Showing demo tasks.`);
        setTasks(mockTasks);
        setLoading(false);
        return;
      }

      const result = await workspace.supabase
        .from("tasks")
        .select("id,title,type,priority,status,due_date,notes,created_at")
        .eq("organization_id", workspace.organizationId)
        .order("created_at", { ascending: false });

      if (result.error) {
        setMessage(`${result.error.message}. Showing demo tasks.`);
        setTasks(mockTasks);
      } else {
        setTasks(result.data?.length ? result.data : mockTasks);
      }

      setLoading(false);
    }

    loadTasks();
  }, []);

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    if (!form.title.trim()) {
      setMessage("Task title is required.");
      setSaving(false);
      return;
    }

    const payload = {
      title: form.title.trim(),
      type: form.type,
      priority: form.priority,
      status: form.status,
      due_date: form.due_date || null,
      notes: form.notes.trim() || null,
    };

    if (isDemoMode) {
      setTasks((current) => [{ id: crypto.randomUUID(), ...payload }, ...current]);
      setForm(emptyForm);
      setMessage("Demo task created locally.");
      setSaving(false);
      return;
    }

    const workspace = await getWorkspace();

    if (workspace.error || !workspace.supabase || !workspace.organizationId || !workspace.userId) {
      setMessage(`${workspace.error} Task was not saved.`);
      setSaving(false);
      return;
    }

    const result = await workspace.supabase
      .from("tasks")
      .insert({
        ...payload,
        organization_id: workspace.organizationId,
        created_by: workspace.userId,
      })
      .select("id,title,type,priority,status,due_date,notes,created_at")
      .single();

    if (result.error) {
      setMessage(result.error.message);
      setSaving(false);
      return;
    }

    setTasks((current) => [result.data, ...current]);
    setForm(emptyForm);
    setMessage("Task saved to Supabase.");
    setSaving(false);
  }

  async function updateTaskStatus(task: Task, status: string) {
    if (isDemoMode) {
      setTasks((current) =>
        current.map((item) => (item.id === task.id ? { ...item, status } : item))
      );
      return;
    }

    const workspace = await getWorkspace();
    if (workspace.error || !workspace.supabase || !workspace.organizationId) return;

    await workspace.supabase
      .from("tasks")
      .update({ status })
      .eq("id", task.id)
      .eq("organization_id", workspace.organizationId);

    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, status } : item))
    );
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ Operations</p>
        <h1 className="mt-2 text-3xl font-bold">Tasks & Activity Timeline</h1>
        <p className="mt-2 text-slate-400">
          Track follow-ups, outreach actions, reminders, and CRM activity.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 text-sm text-blue-100">
          {message}
        </div>
      )}

      <form onSubmit={createTask} className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-5 text-lg font-semibold">Create Task</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            placeholder="Task title"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
          />

          <select
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            value={form.type}
            onChange={(event) => setForm({ ...form, type: event.target.value })}
          >
            <option>Follow-up</option>
            <option>Email</option>
            <option>Call</option>
            <option>Research</option>
            <option>Campaign</option>
          </select>

          <select
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            value={form.priority}
            onChange={(event) => setForm({ ...form, priority: event.target.value })}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <select
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value })}
          >
            <option>Open</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>

          <input
            type="date"
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            value={form.due_date}
            onChange={(event) => setForm({ ...form, due_date: event.target.value })}
          />

          <input
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            placeholder="Notes"
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
          />
        </div>

        <button
          disabled={saving}
          className="mt-5 rounded-xl bg-blue-500 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "Saving Task..." : "Create Task"}
        </button>
      </form>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{loading ? "Loading tasks..." : "Activity Timeline"}</h2>
          <span className="text-sm text-slate-400">{tasks.length} tasks</span>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-xl border border-white/10 bg-slate-950 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-semibold text-white">{task.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {task.type} · {task.priority} priority {task.due_date ? `· Due ${task.due_date}` : ""}
                  </p>
                  {task.notes && <p className="mt-2 text-sm text-slate-500">{task.notes}</p>}
                </div>

                <select
                  className="w-fit rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
                  value={task.status}
                  onChange={(event) => updateTaskStatus(task, event.target.value)}
                >
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
              No activity yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
