"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  createBrowserSupabaseClient,
  isDemoMode,
  supabaseAuth,
} from "@/lib/supabase/client";

type CampaignStep = {
  day: number;
  channel: string;
  subject: string;
  message: string;
};

type Campaign = {
  id: string;
  name: string;
  audience: string;
  status: string;
  steps: CampaignStep[];
  created_at?: string;
};

type CampaignForm = {
  name: string;
  audience: string;
  status: string;
  stepOneSubject: string;
  stepOneMessage: string;
  stepTwoSubject: string;
  stepTwoMessage: string;
  stepThreeSubject: string;
  stepThreeMessage: string;
};

const mockCampaigns: Campaign[] = [
  {
    id: "demo-1",
    name: "Logistics Decision Makers Outreach",
    audience: "Hot and Qualified leads",
    status: "Draft",
    steps: [
      {
        day: 1,
        channel: "Email",
        subject: "Improving logistics visibility",
        message: "Introduce ProspectIQ value proposition.",
      },
      {
        day: 3,
        channel: "Email",
        subject: "Following up",
        message: "Share relevant operational benefit.",
      },
      {
        day: 7,
        channel: "Email",
        subject: "Final check-in",
        message: "Ask for a short discovery call.",
      },
    ],
  },
];

const emptyForm: CampaignForm = {
  name: "",
  audience: "Hot and Qualified leads",
  status: "Draft",
  stepOneSubject: "",
  stepOneMessage: "",
  stepTwoSubject: "",
  stepTwoMessage: "",
  stepThreeSubject: "",
  stepThreeMessage: "",
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [form, setForm] = useState<CampaignForm>(emptyForm);
  const [loading, setLoading] = useState(!isDemoMode);
  const [saving, setSaving] = useState(false);
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
    async function loadCampaigns() {
      if (isDemoMode) {
        setCampaigns(mockCampaigns);
        setLoading(false);
        return;
      }

      const workspace = await getWorkspace();

      if (workspace.error || !workspace.supabase || !workspace.organizationId) {
        setMessage(`${workspace.error} Showing demo campaigns.`);
        setCampaigns(mockCampaigns);
        setLoading(false);
        return;
      }

      const result = await workspace.supabase
        .from("campaigns")
        .select("id,name,audience,status,steps,created_at")
        .eq("organization_id", workspace.organizationId)
        .order("created_at", { ascending: false });

      if (result.error) {
        setMessage(`${result.error.message}. Showing demo campaigns.`);
        setCampaigns(mockCampaigns);
        setLoading(false);
        return;
      }

      setCampaigns(result.data?.length ? result.data : mockCampaigns);
      setMessage(
        result.data?.length
          ? "Loaded live campaigns from Supabase."
          : "No live campaigns yet. Showing demo campaign."
      );
      setLoading(false);
    }

    loadCampaigns();
  }, []);

  function buildSteps(): CampaignStep[] {
    return [
      {
        day: 1,
        channel: "Email",
        subject: form.stepOneSubject.trim() || "Initial outreach",
        message:
          form.stepOneMessage.trim() ||
          "Introduce your offer and explain the business problem you solve.",
      },
      {
        day: 3,
        channel: "Email",
        subject: form.stepTwoSubject.trim() || "Follow-up",
        message:
          form.stepTwoMessage.trim() ||
          "Share a stronger reason to respond, such as speed, savings, growth, or risk reduction.",
      },
      {
        day: 7,
        channel: "Email",
        subject: form.stepThreeSubject.trim() || "Final check-in",
        message:
          form.stepThreeMessage.trim() ||
          "Close the loop and ask for a simple next step.",
      },
    ];
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    if (!form.name.trim()) {
      setMessage("Campaign name is required.");
      setSaving(false);
      return;
    }

    const campaignPayload = {
      name: form.name.trim(),
      audience: form.audience,
      status: form.status,
      steps: buildSteps(),
    };

    if (isDemoMode) {
      const demoCampaign: Campaign = {
        id: crypto.randomUUID(),
        ...campaignPayload,
      };

      setCampaigns((current) => [demoCampaign, ...current]);
      setForm(emptyForm);
      setMessage("Demo campaign created locally.");
      setSaving(false);
      return;
    }

    const workspace = await getWorkspace();

    if (workspace.error || !workspace.supabase || !workspace.organizationId || !workspace.userId) {
      setMessage(`${workspace.error} Campaign was not saved.`);
      setSaving(false);
      return;
    }

    const result = await workspace.supabase
      .from("campaigns")
      .insert({
        ...campaignPayload,
        organization_id: workspace.organizationId,
        created_by: workspace.userId,
      })
      .select("id,name,audience,status,steps,created_at")
      .single();

    if (result.error) {
      setMessage(result.error.message);
      setSaving(false);
      return;
    }

    setCampaigns((current) => [result.data, ...current]);
    setForm(emptyForm);
    setMessage("Campaign sequence saved to Supabase.");
    setSaving(false);
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ Growth</p>
        <h1 className="mt-2 text-3xl font-bold">Campaign Sequencing</h1>
        <p className="mt-2 text-slate-400">
          Build structured multi-touch outreach campaigns for your CRM leads.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 text-sm text-blue-100">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Create Campaign</h2>
          <p className="mt-1 text-sm text-slate-400">
            Create a simple 3-step sequence. Sending automation can be connected later.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
            placeholder="Campaign name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />

          <select
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            value={form.audience}
            onChange={(event) => setForm({ ...form, audience: event.target.value })}
          >
            <option>All leads</option>
            <option>Hot and Qualified leads</option>
            <option>New leads</option>
            <option>Warm leads</option>
            <option>Contacted leads</option>
          </select>

          <select
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value })}
          >
            <option>Draft</option>
            <option>Ready</option>
            <option>Paused</option>
          </select>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
            <p className="mb-3 text-sm font-semibold">Day 1 Email</p>
            <input
              className="mb-3 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="Subject"
              value={form.stepOneSubject}
              onChange={(event) => setForm({ ...form, stepOneSubject: event.target.value })}
            />
            <textarea
              className="min-h-28 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="Message"
              value={form.stepOneMessage}
              onChange={(event) => setForm({ ...form, stepOneMessage: event.target.value })}
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
            <p className="mb-3 text-sm font-semibold">Day 3 Follow-up</p>
            <input
              className="mb-3 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="Subject"
              value={form.stepTwoSubject}
              onChange={(event) => setForm({ ...form, stepTwoSubject: event.target.value })}
            />
            <textarea
              className="min-h-28 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="Message"
              value={form.stepTwoMessage}
              onChange={(event) => setForm({ ...form, stepTwoMessage: event.target.value })}
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
            <p className="mb-3 text-sm font-semibold">Day 7 Final Check-in</p>
            <input
              className="mb-3 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="Subject"
              value={form.stepThreeSubject}
              onChange={(event) => setForm({ ...form, stepThreeSubject: event.target.value })}
            />
            <textarea
              className="min-h-28 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="Message"
              value={form.stepThreeMessage}
              onChange={(event) => setForm({ ...form, stepThreeMessage: event.target.value })}
            />
          </div>
        </div>

        <button
          disabled={saving}
          className="mt-5 rounded-xl bg-blue-500 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving Campaign..." : "Create Campaign"}
        </button>
      </form>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold">
            {loading ? "Loading campaigns..." : "Campaign Library"}
          </h2>

          <span className="text-sm text-slate-400">{campaigns.length} campaigns</span>
        </div>

        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="rounded-xl border border-white/10 bg-slate-950 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{campaign.audience}</p>
                </div>

                <span className="w-fit rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-300">
                  {campaign.status}
                </span>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-3">
                {campaign.steps.map((step) => (
                  <div key={`${campaign.id}-${step.day}`} className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-slate-500">Day {step.day} · {step.channel}</p>
                    <p className="mt-2 text-sm font-semibold text-white">{step.subject}</p>
                    <p className="mt-2 text-sm text-slate-400">{step.message}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {campaigns.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
              No campaigns yet. Create your first sequence above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
