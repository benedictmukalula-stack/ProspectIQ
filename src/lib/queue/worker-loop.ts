import { QUEUE_CONFIG } from "./queue.config.js";
import { calculateBackoff } from "./backoff.js";

export async function runWorkerLoop({
  getJobs,
  processJob,
}: {
  getJobs: (n: number) => Promise<any[]>;
  processJob: (job: any) => Promise<void>;
}) {
  console.log("🚀 Queue worker started");

  while (true) {
    const jobs = await getJobs(QUEUE_CONFIG.concurrency);

    await Promise.all(
      jobs.map(async (job) => {
        try {
          await processJob(job);
        } catch (err) {
          const attempt = (job.attempts ?? 0) + 1;

          if (attempt >= QUEUE_CONFIG.maxRetries) {
            console.error("💀 DLQ:", job.id);
            return;
          }

          const delay = calculateBackoff(attempt);
          console.log(`🔁 Retry job ${job.id} in ${delay}ms`);
        }
      })
    );

    await new Promise((r) => setTimeout(r, 2000));
  }
}
