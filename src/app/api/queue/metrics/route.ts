import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: queueData, error: queueError } = await supabase
    .from("queue")
    .select("status");

  if (queueError) {
    return NextResponse.json({ error: queueError.message }, { status: 500 });
  }

  const counts = { pending: 0, sent: 0, failed: 0 };
  queueData?.forEach((row: any) => {
    if (row.status === "pending") counts.pending++;
    else if (row.status === "sent") counts.sent++;
    else if (row.status === "failed") counts.failed++;
  });

  const { count: deadCount, error: deadError } = await supabase
    .from("dead_letters")
    .select("*", { count: "exact", head: true });

  if (deadError) {
    return NextResponse.json({ error: deadError.message }, { status: 500 });
  }

  return NextResponse.json({
    queue: counts,
    deadLetters: deadCount || 0,
  });
}
