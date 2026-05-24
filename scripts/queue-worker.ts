import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function processJob(job: any) {
  console.log("Processing:", job.id);

  await supabase
    .from("queue")
    .update({ status: "processing" })
    .eq("id", job.id);

  await sleep(1000);

  await supabase
    .from("queue")
    .update({
      status: "sent",
      attempts: (job.attempts || 0) + 1,
    })
    .eq("id", job.id);

  console.log("Done:", job.id);
}

async function runWorker() {
  console.log("Queue worker started...");

  while (true) {
    const now = new Date().toISOString();

    const { data: jobs } = await supabase
      .from("queue")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", now)
      .limit(5);

    if (jobs?.length) {
      for (const job of jobs) {
        await processJob(job);
      }
    }

    await sleep(2000);
  }
}

runWorker();
