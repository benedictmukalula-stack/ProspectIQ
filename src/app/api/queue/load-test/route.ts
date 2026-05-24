import { NextResponse } from "next/server";
import { insertQueueJobs } from "../lib/queue/queue.service";

export async function POST(req: Request) {
  const { count = 5 } = await req.json();

  const jobs = Array.from({ length: count }).map((_, i) => ({
    recipient: `test${i}@example.com`,
    metadata: {},
    status: "pending",
    scheduled_for: new Date().toISOString(),
    attempts: 0,
  }));

  const { error } = await insertQueueJobs(jobs);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, inserted: count });
}
