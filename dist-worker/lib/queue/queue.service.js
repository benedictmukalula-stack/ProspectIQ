"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertQueueJobs = insertQueueJobs;
exports.getPendingJobs = getPendingJobs;
exports.markJobProcessing = markJobProcessing;
exports.markJobSent = markJobSent;
const supabase_1 = require("../supabase");
async function insertQueueJobs(jobs) {
    return supabase_1.supabase.from("queue").insert(jobs);
}
async function getPendingJobs(limit = 10) {
    const now = new Date().toISOString();
    return supabase_1.supabase
        .from("queue")
        .select("*")
        .eq("status", "pending")
        .lte("scheduled_for", now)
        .limit(limit);
}
async function markJobProcessing(id) {
    return supabase_1.supabase
        .from("queue")
        .update({ status: "processing" })
        .eq("id", id);
}
async function markJobSent(id, attempts) {
    return supabase_1.supabase
        .from("queue")
        .update({
        status: "sent",
        attempts: attempts + 1,
    })
        .eq("id", id);
}
