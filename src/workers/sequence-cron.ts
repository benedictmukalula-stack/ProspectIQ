const INTERVAL_MS = 60 * 60 * 1000; // once per hour

async function run() {
  const res = await fetch("http://localhost:3000/api/sequences/process", { method: "POST" });
  const data = await res.json();
  console.log(`[Sequence Cron] Processed: ${data.processed || 0}`);
}

run();
setInterval(run, INTERVAL_MS);
