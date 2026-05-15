const campaigns = [
  {
    name: "Logistics Decision Makers",
    audience: "Operations Directors",
    sent: 1240,
    opens: "48%",
    replies: "14%",
    status: "Running",
  },
  {
    name: "African Freight Network",
    audience: "Supply Chain Managers",
    sent: 860,
    opens: "42%",
    replies: "11%",
    status: "Scheduled",
  },
  {
    name: "Import Export Executives",
    audience: "Commercial Directors",
    sent: 540,
    opens: "51%",
    replies: "17%",
    status: "Completed",
  },
];

export default function CampaignsPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-slate-400">ProspectIQ Campaigns</p>

        <h1 className="mt-2 text-3xl font-bold">Campaigns</h1>

        <p className="mt-2 text-slate-400">
          Phase 5A outbound campaign management using mock data only.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
          <p className="text-sm text-slate-400">Total Campaigns</p>
          <h2 className="mt-2 text-3xl font-bold">12</h2>
        </div>

        <button className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-medium text-white">
          Create Campaign — Coming Soon
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {campaigns.map((campaign) => (
          <div
            key={campaign.name}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {campaign.name}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {campaign.audience}
                </p>
              </div>

              <span className="rounded-full bg-blue-400/10 px-3 py-1 text-xs text-blue-300">
                {campaign.status}
              </span>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Emails Sent</span>
                <span>{campaign.sent}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Open Rate</span>
                <span className="text-emerald-300">
                  {campaign.opens}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Reply Rate</span>
                <span className="text-amber-300">
                  {campaign.replies}
                </span>
              </div>
            </div>

            <button className="mt-6 w-full rounded-xl bg-slate-800 px-4 py-3 text-sm text-slate-200 hover:bg-slate-700">
              View Campaign — Coming Soon
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
