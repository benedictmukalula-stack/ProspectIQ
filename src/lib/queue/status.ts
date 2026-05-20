export const OUTBOUND_STATUS = {
  PENDING: "pending",
  QUEUED: "queued",
  SENDING: "sending",
  SENT: "sent",
  OPENED: "opened",
  CLICKED: "clicked",
  REPLIED: "replied",
  BOUNCED: "bounced",
  FAILED: "failed",
} as const;

export type OutboundStatus = typeof OUTBOUND_STATUS[keyof typeof OUTBOUND_STATUS];
