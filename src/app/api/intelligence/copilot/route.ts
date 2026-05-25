import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: recentJobs } = await supabase
    .from("queue")
    .select("status, sent_at, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  const suggestions = [];
  const sentCount = recentJobs?.filter(j => j.status === "sent").length || 0;
  const pendingCount = recentJobs?.filter(j => j.status === "pending").length || 0;
  const failedCount = recentJobs?.filter(j => j.status === "failed").length || 0;

  if (sentCount > 5) {
    suggestions.push(`📨 ${sentCount} recent emails sent. Check engagement metrics (opens/clicks).`);
  }
  if (pendingCount > 0) {
    suggestions.push(`⏳ ${pendingCount} pending jobs. Verify queue worker is polling.`);
  }
  if (failedCount > 0) {
    suggestions.push(`❌ ${failedCount} failed jobs. Review email provider configuration.`);
  }

  // Optional: add tip about dead letters
  const { count: deadCount } = await supabase
    .from("dead_letters")
    .select("*", { count: "exact", head: true });

  if (deadCount && deadCount > 0) {
    suggestions.push(`🗑️ ${deadCount} dead letters. Retry them from admin panel.`);
  }

  if (suggestions.length === 0) {
    suggestions.push("💡 No recent queue activity. Use load test to generate sample emails.");
  }

  return NextResponse.json({
    suggestions,
    context: `Based on last ${recentJobs?.length || 0} queue items`
  });
}
