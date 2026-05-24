import { NextResponse } from "next/server";
import { getPendingJobs } from "../lib/queue/queue.service";

export async function POST() {
  const { data, error } = await getPendingJobs(10);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, count: data?.length || 0, items: data });
}
