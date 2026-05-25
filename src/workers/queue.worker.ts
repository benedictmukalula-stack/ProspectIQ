import { getPendingJobs } from "../lib/queue/queue.service.js";
import { mapQueueJob } from "../lib/queue/mapQueueJob.js";
import { runWorkerLoop } from "../lib/queue/worker-loop.js";

async function getJobs(n: number) {
  const { data = [] } = await getPendingJobs(n);
  return data.map(mapQueueJob);
}

async function processJob(job: any) {
  console.log("📨 Processing:", job.id);
  // your existing send logic stays here
}

runWorkerLoop({ getJobs, processJob });
