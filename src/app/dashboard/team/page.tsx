"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  createBrowserSupabaseClient,
  isDemoMode,
  supabaseAuth,
} from "@/lib/supabase/client";

type TeamMember = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
};

const mockMembers: TeamMember[] = [
  {
    id: "1",
    full_name: "Benedict Mukalula",
    email: "benedict@prospectiq.ai",
    role: "Admin",
    status: "Active",
  },
  {
    id: "2",
    full_name: "Sales Manager",
    email: "sales@prospectiq.ai",
    role: "Manager",
    status: "Pending",
  },
];

const emptyForm = {
  full_name: "",
  email: "",
  role: "Member",
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(mockMembers);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(!isDemoMode);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function getWorkspace() {
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      return {
        supabase: null,
        organizationId: null,
        userId: null,
        error: "Supabase unavailable.",
      };
    }

    const userResult = await supabaseAuth.getUser();

    if (userResult.error || !userResult.data.user) {
      return {
        supabase,
        organizationId: null,
        userId: null,
        error: "No active session.",
      };
    }

    const workspaceResult = await supabase.rpc("ensure_user_workspace");

    if (workspaceResult.error || !workspaceResult.data?.[0]) {
      return {
        supabase,
        organizationId: null,
        userId: userResult.data.user.id,
        error: "Workspace not ready.",
      };
    }

    return {
      supabase,
      organizationId: workspaceResult.data[0].organization_id,
      userId: userResult.data.user.id,
      error: null,
    };
  }

  useEffect(() => {
    async function loadTeam() {
      if (isDemoMode) {
        setLoading(false);
        return;
      }

      const workspace = await getWorkspace();

      if (
        workspace.error ||
        !workspace.supabase ||
        !workspace.organizationId
      ) {
        setMessage(`${workspace.error} Showing demo team.`);
        setLoading(false);
        return;
      }

      const result = await workspace.supabase
        .from("team_members")
        .select("id,full_name,email,role,status")
        .eq("organization_id", workspace.organizationId)
        .order("created_at", { ascending: false });

      if (result.error) {
        setMessage(`${result.error.message} Showing demo team.`);
      } else {
        setMembers(result.data?.length ? result.data : mockMembers);
      }

      setLoading(false);
    }

    loadTeam();
  }, []);

  async function inviteMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.full_name.trim() || !form.email.trim()) {
      setMessage("Name and email are required.");
      return;
    }

    setSaving(true);
    setMessage("");

    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      role: form.role,
      status: "Pending",
    };

    if (isDemoMode) {
      setMembers((current) => [
        {
          id: crypto.randomUUID(),
          ...payload,
        },
        ...current,
      ]);

      setForm(emptyForm);
      setMessage("Demo member invited locally.");
      setSaving(false);
      return;
    }

    const workspace = await getWorkspace();

    if (
      workspace.error ||
      !workspace.supabase ||
      !workspace.organizationId ||
      !workspace.userId
    ) {
      setMessage(`${workspace.error} Member was not added.`);
      setSaving(false);
      return;
    }

    const result = await workspace.supabase
      .from("team_members")
      .insert({
        ...payload,
        organization_id: workspace.organizationId,
        invited_by: workspace.userId,
      })
      .select("id,full_name,email,role,status")
      .single();

    if (result.error) {
      setMessage(result.error.message);
      setSaving(false);
      return;
    }

    setMembers((current) => [result.data, ...current]);
    setForm(emptyForm);
    setMessage("Team member invited successfully.");
    setSaving(false);
  }

  async function updateStatus(member: TeamMember, status: string) {
    if (isDemoMode) {
      setMembers((current) =>
        current.map((item) =>
          item.id === member.id ? { ...item, status } : item
        )
      );
      return;
    }

    const workspace = await getWorkspace();

    if (
      workspace.error ||
      !workspace.supabase ||
      !workspace.organizationId
    ) {
      return;
    }

    await workspace.supabase
      .from("team_members")
      .update({ status })
      .eq("id", member.id)
      .eq("organization_id", workspace.organizationId);

    setMembers((current) =>
      current.map((item) =>
        item.id === member.id ? { ...item, status } : item
      )
    );
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ Workspace</p>
        <h1 className="mt-2 text-3xl font-bold">Team Collaboration</h1>
        <p className="mt-2 text-slate-400">
          Invite team members and manage workspace collaboration.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 text-sm text-blue-100">
          {message}
        </div>
      )}

      <form
        onSubmit={inviteMember}
        className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6"
      >
        <h2 className="mb-5 text-lg font-semibold">Invite Team Member</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            placeholder="Full name"
            value={form.full_name}
            onChange={(event) =>
              setForm({ ...form, full_name: event.target.value })
            }
          />

          <input
            type="email"
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            placeholder="Email address"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
          />

          <select
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            value={form.role}
            onChange={(event) =>
              setForm({ ...form, role: event.target.value })
            }
          >
            <option>Admin</option>
            <option>Manager</option>
            <option>Member</option>
            <option>Viewer</option>
          </select>
        </div>

        <button
          disabled={saving}
          className="mt-5 rounded-xl bg-blue-500 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "Inviting..." : "Invite Member"}
        </button>
      </form>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Team Members</p>
          <p className="mt-3 text-3xl font-bold">
            {loading ? "..." : members.length}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Admins</p>
          <p className="mt-3 text-3xl font-bold">
            {loading
              ? "..."
              : members.filter((member) => member.role === "Admin").length}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Managers</p>
          <p className="mt-3 text-3xl font-bold">
            {loading
              ? "..."
              : members.filter((member) => member.role === "Manager").length}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Pending Invites</p>
          <p className="mt-3 text-3xl font-bold">
            {loading
              ? "..."
              : members.filter((member) => member.status === "Pending").length}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {loading ? "Loading team..." : "Workspace Team"}
          </h2>

          <span className="text-sm text-slate-400">
            {members.length} members
          </span>
        </div>

        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="rounded-xl border border-white/10 bg-slate-950 p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-semibold text-white">
                    {member.full_name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {member.email}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-300">
                      {member.role}
                    </span>

                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                      {member.status}
                    </span>
                  </div>
                </div>

                <select
                  className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
                  value={member.status}
                  onChange={(event) =>
                    updateStatus(member, event.target.value)
                  }
                >
                  <option>Pending</option>
                  <option>Active</option>
                  <option>Suspended</option>
                </select>
              </div>
            </div>
          ))}

          {members.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
              No team members yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
