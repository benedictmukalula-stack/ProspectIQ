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
};

type QueuedEmail = {
  id: string;
  lead_name: string;
  lead_email: string;
  company: string;
  campaign_name: string;
  subject: string;
  message: string;
  send_day: number;
  status: string;
  sender_name?: string | null;
  sender_email?: string | null;
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

const mockCampaigns: Campaign[] = [
  {
    id: "demo-1",
    name: "Logistics Decision Makers Outreach",
    audience: "Hot and Qualified leads",
    status: "Ready",
    steps: [
      {
        day: 1,
        channel: "Email",
        subject: "Improving logistics visibility",
        message: "Hi {{name}}, I wanted to connect regarding {{company}} and your logistics growth priorities.",
      },
      {
        day: 3,
        channel: "Email",
        subject: "Following up on logistics efficiency",
        message: "Hi {{name}}, following up with a quick note on how teams improve visibility and sales execution.",
      },
      {
        day: 7,
        channel: "Email",
        subject: "Worth a quick conversation?",
        message: "Hi {{name}}, would it make sense to schedule a short discovery call?",
      },
    ],
  },
];

function personalize(text: string, lead: Lead) {
  return text
    .replaceAll("{{name}}", lead.name)
    .replaceAll("{{company}}", lead.company)
    .replaceAll("{{role}}", lead.role || "your role");
}

export default function EmailPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [queuedEmails, setQueuedEmails] = useState<QueuedEmail[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [senderName, setSenderName] = useState("ProspectIQ Team");
  const [senderEmail, setSenderEmail] = useState("hello@prospectiq.ai");
  const [loading, setLoading] = useState(!isDemoMode);
  const [launching, setLaunching] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
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
    async function loadEmailContext() {
      if (isDemoMode) {
        setSelectedCampaignId(mockCampaigns[0]?.id || "");
        setLoading(false);
        return;
      }

      const workspace = await getWorkspace();

      if (workspace.error || !workspace.supabase || !workspace.organizationId) {
        setMessage(`${workspace.error} Showing demo email context.`);
        setSelectedCampaignId(mockCampaigns[0]?.id || "");
        setLoading(false);
        return;
      }

      const [leadResult, campaignResult, queueResult] = await Promise.all([
        workspace.supabase
          .from("leads")
          .select("id,name,company,role,email,score,status")
          .eq("organization_id", workspace.organizationId)
          .order("created_at", { ascending: false }),
        workspace.supabase
          .from("campaigns")
          .select("id,name,audience,status,steps")
          .eq("organization_id", workspace.organizationId)
          .order("created_at", { ascending: false }),
        workspace.supabase
          .from("email_queue")
          .select("id,lead_name,lead_email,company,campaign_name,subject,message,send_day,status,sender_name,sender_email")
          .eq("organization_id", workspace.organizationId)
          .order("created_at", { ascending: false }),
      ]);

      if (!leadResult.error) setLeads(leadResult.data?.length ? leadResult.data : mockLeads);
      if (!campaignResult.error) {
        const liveCampaigns = (campaignResult.data || []) as Campaign[];
        setCampaigns(liveCampaigns.length ? liveCampaigns : mockCampaigns);
        setSelectedCampaignId(liveCampaigns[0]?.id || mockCampaigns[0]?.id || "");
      }
      if (!queueResult.error) setQueuedEmails(queueResult.data || []);

      setMessage("Loaded email and campaign context from workspace.");
      setLoading(false);
    }

    loadEmailContext();
  }, []);

  const selectedCampaign = useMemo(() => {
    return campaigns.find((campaign) => campaign.id === selectedCampaignId) || campaigns[0];
  }, [campaigns, selectedCampaignId]);

  const eligibleLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (!lead.email) return false;
      if (!selectedCampaign) return false;

      if (selectedCampaign.audience === "All leads") return true;
      if (selectedCampaign.audience === "Hot and Qualified leads") {
        return lead.status === "Hot" || lead.status === "Qualified";
      }
      if (selectedCampaign.audience === "New leads") return lead.status === "New";
      if (selectedCampaign.audience === "Warm leads") return lead.status === "Warm";
      if (selectedCampaign.audience === "Contacted leads") return lead.status === "Contacted";

      return true;
    });
  }, [leads, selectedCampaign]);

  function buildQueuePayload() {
    if (!selectedCampaign) return [];

    return eligibleLeads.flatMap((lead) =>
      selectedCampaign.steps.map((step) => ({
        lead_id: lead.id,
        lead_name: lead.name,
        lead_email: lead.email || "",
        company: lead.company,
        campaign_id: selectedCampaign.id,
        campaign_name: selectedCampaign.name,
        subject: personalize(step.subject, lead),
        message: personalize(step.message, lead),
        send_day: step.day,
        status: "Queued",
        sender_name: senderName,
        sender_email: senderEmail,
      }))
    );
  }

  async function launchCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLaunching(true);
    setMessage("");

    if (!selectedCampaign) {
      setMessage("Select a campaign first.");
      setLaunching(false);
      return;
    }

    if (!senderName.trim() || !senderEmail.trim()) {
      setMessage("Sender name and sender email are required.");
      setLaunching(false);
      return;
    }

    const queuePayload = buildQueuePayload();

    if (queuePayload.length === 0) {
      setMessage("No eligible leads with email addresses found for this campaign.");
      setLaunching(false);
      return;
    }

    if (isDemoMode) {
      const demoQueue: QueuedEmail[] = queuePayload.map((item) => ({
        id: crypto.randomUUID(),
        lead_name: item.lead_name,
        lead_email: item.lead_email,
        company: item.company,
        campaign_name: item.campaign_name,
        subject: item.subject,
        message: item.message,
        send_day: item.send_day,
        status: "Queued",
      }));

      setQueuedEmails((current) => [...demoQueue, ...current]);
      setMessage(`Demo campaign queued: ${demoQueue.length} email steps prepared.`);
      setLaunching(false);
      return;
    }

    const workspace = await getWorkspace();

    if (workspace.error || !workspace.supabase || !workspace.organizationId || !workspace.userId) {
      setMessage(`${workspace.error} Campaign was not queued.`);
      setLaunching(false);
      return;
    }

    const result = await workspace.supabase
      .from("email_queue")
      .insert(
        queuePayload.map((item) => ({
          ...item,
          organization_id: workspace.organizationId,
          created_by: workspace.userId,
        }))
      )
      .select("id,lead_name,lead_email,company,campaign_name,subject,message,send_day,status,sender_name,sender_email");

    if (result.error) {
      setMessage(result.error.message);
      setLaunching(false);
      return;
    }

    setQueuedEmails((current) => [...(result.data || []), ...current]);
    setMessage(`Campaign queued successfully: ${result.data?.length || 0} email steps prepared.`);
    setLaunching(false);
  }


  async function sendQueuedEmail(email: QueuedEmail) {
    setSendingEmailId(email.id);
    setMessage("");

    const fromAddress = email.sender_email || senderEmail;
    const fromName = email.sender_name || senderName;
    const formattedFrom = `${fromName} <${fromAddress}>`;

    const response = await fetch("/api/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient_email: email.lead_email,
        from: formattedFrom,
        subject: email.subject,
        message: email.message,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error || "Email sending failed.");
      setSendingEmailId(null);
      return;
    }

    if (!isDemoMode) {
      const workspace = await getWorkspace();

      if (workspace.supabase && workspace.organizationId) {
        await workspace.supabase
          .from("email_queue")
          .update({
            status: "Sent",
            provider_message_id: result.id || null,
            sent_at: new Date().toISOString(),
          })
          .eq("id", email.id)
          .eq("organization_id", workspace.organizationId);
      }
    }

    setQueuedEmails((current) =>
      current.map((item) =>
        item.id === email.id ? { ...item, status: "Sent" } : item
      )
    );

    setMessage(`Email sent to ${email.lead_email}.`);
    setSendingEmailId(null);
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ Outbound</p>
        <h1 className="mt-2 text-3xl font-bold">Email Integration & Campaign Sending</h1>
        <p className="mt-2 text-slate-400">
          Queue personalized campaign email steps for eligible CRM leads. Real sending can connect to Resend, SMTP, or Gmail API next.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-blue-400/30 bg-blue-400/10 p-4 text-sm text-blue-100">
          {message}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Campaigns</p>
          <p className="mt-3 text-3xl font-bold">{loading ? "..." : campaigns.length}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Eligible Leads</p>
          <p className="mt-3 text-3xl font-bold">{loading ? "..." : eligibleLeads.length}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Queued Emails</p>
          <p className="mt-3 text-3xl font-bold">{loading ? "..." : queuedEmails.length}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Prepared Steps</p>
          <p className="mt-3 text-3xl font-bold">
            {loading ? "..." : selectedCampaign ? eligibleLeads.length * selectedCampaign.steps.length : 0}
          </p>
        </div>
      </div>

      <form onSubmit={launchCampaign} className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-5 text-lg font-semibold">Queue Campaign Emails</h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            placeholder="Sender name"
            value={senderName}
            onChange={(event) => setSenderName(event.target.value)}
          />

          <input
            type="email"
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            placeholder="Sender email"
            value={senderEmail}
            onChange={(event) => setSenderEmail(event.target.value)}
          />

          <select
            className="rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none xl:col-span-2"
            value={selectedCampaignId}
            onChange={(event) => setSelectedCampaignId(event.target.value)}
          >
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name} · {campaign.audience}
              </option>
            ))}
          </select>
        </div>

        <button
          disabled={launching}
          className="mt-5 rounded-xl bg-blue-500 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {launching ? "Queueing Campaign..." : "Queue Campaign Emails"}
        </button>

        <p className="mt-3 text-xs text-slate-500">
          Safety mode: this creates a send queue only. It does not send live emails until an email provider is connected.
        </p>
      </form>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Email Queue</h2>
          <span className="text-sm text-slate-400">{queuedEmails.length} queued</span>
        </div>

        <div className="space-y-4">
          {queuedEmails.map((email) => (
            <div key={email.id} className="rounded-xl border border-white/10 bg-slate-950 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-300">
                      Day {email.send_day}
                    </span>
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                      {email.status}
                    </span>
                  </div>

                  <h3 className="mt-3 font-semibold text-white">{email.subject}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    To {email.lead_name} · {email.lead_email} · {email.company}
                  </p>
                  <p className="mt-3 text-sm text-slate-500">{email.message}</p>
                </div>

                <div className="flex flex-col items-start gap-3 md:items-end">
                  <span className="text-xs text-slate-500">{email.campaign_name}</span>

                  <button
                    type="button"
                    disabled={email.status === "Sent" || sendingEmailId === email.id}
                    onClick={() => sendQueuedEmail(email)}
                    className="rounded-lg border border-emerald-400/30 px-3 py-2 text-xs text-emerald-300 hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sendingEmailId === email.id
                      ? "Sending..."
                      : email.status === "Sent"
                        ? "Sent"
                        : "Send Now"}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {queuedEmails.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
              No emails queued yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
