import {
  campaignPreviews,
  getCampaignStatusColor,
} from "../lib/mock-data";

export function CampaignPreviewCards() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Campaigns</h3>
        <p className="mt-0.5 text-xs text-zinc-500">Active and recent outreach campaigns</p>
      </div>

      <div className="space-y-3">
        {campaignPreviews.map((campaign) => (
          <div
            key={campaign.id}
            className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-3 transition-colors hover:border-white/[0.08]"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-200">
                  {campaign.name}
                </p>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-zinc-500">
                  <span>
                    {campaign.sent.toLocaleString()} sent
                  </span>
                  <span>
                    {campaign.openRate.recipientFixed(1)}% opened
                  </span>
                  <span>
                    {campaign.replyRate.recipientFixed(1)}% replied
                  </span>
                </div>
              </div>
              <span
                className={`ml-3 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${getCampaignStatusColor(campaign.status)}`}
              >
                {campaign.status}
              </span>
            </div>

            {/* Mini progress bar */}
            {campaign.sent > 0 && (
              <div className="mt-3 flex gap-1">
                <div
                  className="h-1 rounded-full bg-blue-400/40"
                  style={{ width: `${campaign.openRate}%` }}
                  title={`Opened: ${campaign.openRate}%`}
                />
                <div
                  className="h-1 rounded-full bg-emerald-400/60"
                  style={{ width: `${campaign.replyRate * 3}%` }}
                  title={`Replied: ${campaign.replyRate}%`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
