import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  // Get queue counts
  const { data: queueData } = await supabase.from("queue").select("status");
  const pending = queueData?.filter(j => j.status === "pending").length || 0;
  const sent = queueData?.filter(j => j.status === "sent").length || 0;
  const failed = queueData?.filter(j => j.status === "failed").length || 0;

  // Get dead letter count
  const { count: deadCount } = await supabase
    .from("dead_letters")
    .select("*", { count: "exact", head: true });

  // Get recent leads (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { count: newLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .gte("created_at", sevenDaysAgo.toISOString());

  const recommendations = [];

  if (pending > 10) {
    recommendations.push(`📊 Pending queue: ${pending} messages. Increase worker concurrency or scale up.`);
  } else if (pending > 0) {
    recommendations.push(`⏳ ${pending} pending messages. Ensure queue worker is running (pm2 list).`);
  }

  if (deadCount && deadCount > 0) {
    recommendations.push(`⚠️ ${deadCount} dead letters found. Visit /admin/dead-letters to retry.`);
  }

  if (newLeads && newLeads > 0) {
    recommendations.push(`🎯 ${newLeads} new leads in last 7 days. Run outbound sequences to engage them.`);
  }

  if (sent === 0 && pending === 0) {
    recommendations.push("📭 No queue activity. Load test with POST /api/queue/load-test");
  }

  if (recommendations.length === 0) {
    recommendations.push("✅ All systems healthy. No immediate actions needed.");
  }

  return NextResponse.json({ recommendations });
}
