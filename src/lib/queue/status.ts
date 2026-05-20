export const QUEUE_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SENT: "sent",
  FAILED: "failed",
} as const;

export type QueueStatus =
  (typeof QUEUE_STATUS)[keyof typeof QUEUE_STATUS];
