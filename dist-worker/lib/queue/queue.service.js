import { supabase } from "../supabase.js";
export async function insertQueueJobs(jobs) {
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
export async function markJobProcessing(id) {
    return supabase
        .from("queue")
        .update({ status: "processing" })
        .eq("id", id);
}
export async function markJobSent(id, attempts) {
    return supabase
        .from("queue")
        .update({
        status: "sent",
        attempts: attempts + 1,
    })
        .eq("id", id);
}
