const CHECK_INTERVAL_MS = 60 * 60 * 1000; // once per hour

async function check() {
  try {
    const res = await fetch("http://localhost:3000/api/admin/check-alerts");
    const data = await res.json();
    console.log(`Alert check: ${data.deadLetters} dead letters, threshold=${data.threshold}, alert=${data.alertTriggered}`);
  } catch (err) {
    console.error("Alert check failed:", err);
  }
}

async function run() {
  await check(); // run immediately on start
  setInterval(check, CHECK_INTERVAL_MS);
}

run().catch(console.error);
