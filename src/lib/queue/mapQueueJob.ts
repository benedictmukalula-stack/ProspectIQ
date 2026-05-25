import { QueueJob } from "./queue.types";

export function mapQueueJob(raw: any): QueueJob {
  return {
    id: raw.id,
    workspaceId: raw.workspace_id,

    email: raw.email ?? raw.recipient ?? "",
    recipient_email: raw.email ?? raw.recipient ?? "",

    subject: raw.subject ?? "",
    body: raw.body ?? "",

    attempts: raw.attempts ?? 0,

    protection: raw.protection ?? {
      throttle: false,
      switchProvider: false,
    },
  };
}
