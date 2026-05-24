"use client"

import { useState } from "react"
import { FeatureGate } from "../components/features/feature-gate"

const members = [
  {
    name: "Benedict Mukalula",
    email: "benedict.mukalula@gmail.com",
    role: "Owner",
    status: "Active",
    lastActive: "Today",
  },
  {
    name: "Sales Operations",
    email: "sales.ops@example.com",
    role: "Admin",
    status: "Pending Invite",
    lastActive: "Not joined",
  },
  {
    name: "Research Analyst",
    email: "research@example.com",
    role: "Member",
    status: "Pending Invite",
    lastActive: "Not joined",
  },
]

const permissions = [
  ["Owner", "Full workspace control", "Billing, users, security, data, integrations"],
  ["Admin", "Operational control", "Leads, CRM, campaigns, workflows, reporting"],
  ["Member", "Execution access", "Assigned leads, tasks, sequences, activity"],
  ["Viewer", "Read-only access", "Reports, dashboards, analytics"],
]

export default function TeamPage() {
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("Member")
  const [message, setMessage] = useState("")

  function sendInvite() {
    if (!inviteEmail.trim()) {
      setMessage("Enter an email address before sending an invite.")
      return
    }

    setMessage(`Invite prepared for ${inviteEmail} as ${inviteRole}. Email sending can be connected next.`)
    setInviteEmail("")
  }

  return (
    <FeatureGate
      feature="team_management"
      title="Team management requires Business"
      description="Upgrade to Business to invite team members, manage workspace roles, and enable collaboration."
    >
      <main className="space-y-8">
        <section className="rounded-2xl border bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white">
          <p className="text-sm text-slate-300">Workspace Administration</p>
          <h1 className="mt-2 text-3xl font-bold">Premium Team Center</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300">
            Manage users, invitations, roles, permissions, collaboration access, and workspace governance.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              ["Members", members.length],
              ["Active Users", members.filter((m) => m.status === "Active").length],
              ["Pending Invites", members.filter((m) => m.status.includes("Pending")).length],
              ["Role Groups", permissions.length],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs text-slate-300">{label}</p>
                <p className="mt-2 text-3xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {message && <div className="rounded-xl border p-4 text-sm">{message}</div>}

        <section className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
          <div className="rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">Invite Team Member</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Prepare workspace invitations and assign access level.
            </p>

            <div className="mt-5 space-y-4">
              <input
                className="w-full rounded-xl border px-4 py-3 text-sm"
                placeholder="name@company.com"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
              />

              <select
                className="w-full rounded-xl border px-4 py-3 text-sm"
                value={inviteRole}
                onChange={(event) => setInviteRole(event.target.value)}
              >
                <option>Admin</option>
                <option>Member</option>
                <option>Viewer</option>
              </select>

              <button onClick={sendInvite} className="w-full rounded-lg bg-black px-4 py-2 text-sm text-white">
                Prepare Invite
              </button>
            </div>
          </div>

          <div className="rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">Workspace Members</h2>

            <div className="mt-5 space-y-4">
              {members.map((member) => (
                <div key={member.email} className="grid gap-4 rounded-xl border p-4 md:grid-cols-[1fr_auto]">
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Last active: {member.lastActive}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border px-3 py-1 text-xs">{member.role}</span>
                    <span className="rounded-full border px-3 py-1 text-xs">{member.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Permission Matrix</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {permissions.map(([role, scope, detail]) => (
              <div key={role} className="rounded-xl border bg-muted/40 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{role}</h3>
                  <span className="rounded-full border px-2 py-0.5 text-xs">Access Role</span>
                </div>
                <p className="mt-2 text-sm font-medium">{scope}</p>
                <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </FeatureGate>
  )
}
