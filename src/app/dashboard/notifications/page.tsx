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
  score: number;
  status: string;
};

type Task = {
  id: string;
  title: string;
  priority: string;
  status: string;
  due_date: string | null;
};

type Campaign = {
  id: string;
  name: string;
  status: string;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
};

const mockLeads: Lead[] = [
  { id: "1", name: "Sarah M.", company: "Atlas Freight", score: 92, status: "Hot" },
  { id: "2", name: "James K.", company: "TradeLink Africa", score: 88, status: "Qualified" },
];

const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Follow up with Atlas Freight",
    priority: "High",
    status: "Open",
    due_date: null,
  },
];

const mockCampaigns: Campaign[] = [
  { id: "campaign-1", name: "Logistics Decision Makers Outreach", status: "Draft" },
];

export default function NotificationsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
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
    async function loadNotificationsContext() {
      if (isDemoMode) {
        setLoading(false);
        return;
      }

      const workspace = await getWorkspace();

      if (workspace.error || !workspace.supabase || !workspace.organizationId) {
        setMessage(`${workspace.error} Showing demo notifications.`);
        setLoading(false);
        return;
      }

      const [leadResult, taskResult, campaignResult] = await Promise.all([
        workspace.supabase
          .from("leads")
          .select("id,name,company,score,status")
          .eq("organization_id", workspace.organizationId),
        workspace.supabase
          .from("tasks")
          .select("id,title,priority,status,due_date")
          .eq("organization_id", workspace.organizationId),
        workspace.supabase
          .from("campaigns")
          .select("id,name,status")
          .eq("organization_id", workspace.organizationId),
      ]);

      if (!leadResult.error) setLeads(leadResult.data?.length ? leadResult.data : mockLeads);
      if (!taskResult.error) setTasks(taskResult.data?.length ? taskResult.data : mockTasks);
      if (!campaignResult.error) setCampaigns(campaignResult.data?.length ? campaignResult.data : mockCampaigns);

      setMessage("Loaded notification signals from workspace data.");
      setLoading(false);
    }

    loadNotificationsContext();
  }, []);

  const notifications = useMemo<Notification[]>(() => {
    const items: Notification[] = [];

    leads
      .filter((lead) => lead.status === "Hot" || lead.score >= 85)
      .forEach((lead) => {
        items.push({
          id: `lead-${lead.id}`,
          title: "High-priority lead",
          message: `${lead.name} at ${lead.company} has score ${lead.score} and status ${lead.status}.`,
          type: "Lead",
          priority: "High",
        });
      });

    tasks
      .filter((task) => task.status !== "Done")
      .forEach((task) => {
        items.push({
          id: `task-${task.id}`,
          title: "Open task",
          message: `${task.title}${task.due_date ? ` · Due ${task.due_date}` : ""}`,
          type: "Task",
          priority: task.priority,
        });
      });

    campaigns
      .filter((campaign) => campaign.status === "Draft")
      .forEach((campaign) => {
        items.push({
          id: `campaign-${campaign.id}`,
          title: "Campaign draft pending",
          message: `${campaign.name} is still in Draft. Review and mark it Ready when complete.`,
          type: "Campaign",
          priority: "Medium",
        });
      });

    return items.sort((a, b) => {
      const weight = { High: 3, Medium: 2, Low: 1 } as Record<string, number>;
      return (weight[b.priority] || 0) - (weight[a.priority] || 0);
    });
  }, [leads, tasks, campaigns]);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ Command Center</p>
        <h1 className="mt-2 text-3xl font-bold">Notification Center</h1>
        <p className="mt-2 text-slate-400">
          Workspace alerts generated from leads, tasks, campaigns, and CRM activity.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 text-sm text-blue-100">
          {message}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Total Alerts</p>
          <p className="mt-3 text-3xl font-bold">{loading ? "..." : notifications.length}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">High Priority</p>
          <p className="mt-3 text-3xl font-bold">
            {loading ? "..." : notifications.filter((item) => item.priority === "High").length}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Open Tasks</p>
          <p className="mt-3 text-3xl font-bold">
            {loading ? "..." : tasks.filter((task) => task.status !== "Done").length}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Hot Leads</p>
          <p className="mt-3 text-3xl font-bold">
            {loading ? "..." : leads.filter((lead) => lead.status === "Hot").length}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {loading ? "Loading notifications..." : "Live Alerts"}
          </h2>
          <span className="text-sm text-slate-400">{notifications.length} alerts</span>
        </div>

        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="rounded-xl border border-white/10 bg-slate-950 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-300">
                      {notification.type}
                    </span>
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                      {notification.priority}
                    </span>
                  </div>

                  <h3 className="mt-3 font-semibold text-white">{notification.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{notification.message}</p>
                </div>

                <span className="text-xs text-slate-500">Workspace signal</span>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
              No notifications right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
