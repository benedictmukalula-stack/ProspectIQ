import { supabase } from "../supabase";

export type QueueJob = {
  id: string;
  recipient: string;
  status: string;
  scheduled_for: string;
  attempts: number;
  metadata: any;
};

export async function insertQueueJobs(jobs: Partial<QueueJob>[]) {
  return supabase.from("queue").insert(jobs);
}

export async function getPendingJobs(limit = 10) {
  const now = new Date().toISOString();

  return supabase
    .from("queue")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_for", now)
    .limit(limit);
}

export async function markJobProcessing(id: string) {
  return supabase
    .from("queue")
    .update({ status: "processing" })
    .eq("id", id);
}

export async function markJobSent(id: string, attempts: number) {
  return supabase
    .from("queue")
    .update({
      status: "sent",
      attempts: attempts + 1,
    })
    .eq("id", id);
}
