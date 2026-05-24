import "dotenv/config";
import "dotenv/config";
import {
  getPendingJobs,
  markJobProcessing,
  markJobSent,
} from "../lib/queue/queue.service.js";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function processJob(job: any) {
  console.log("Processing:", job.id);

  await markJobProcessing(job.id);

  await sleep(1000);

  await markJobSent(job.id, job.attempts || 0);

  console.log("Done:", job.id);
}

async function run() {
  console.log("Queue worker running...");

  while (true) {
    const { data } = await getPendingJobs(5);

    if (data?.length) {
      for (const job of data) {
        await processJob(job);
      }
    }

    await sleep(2000);
  }
}

run();
