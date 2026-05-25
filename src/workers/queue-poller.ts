const POLL_INTERVAL_MS = 5000;
async function poll() {
  while (true) {
    await fetch("http://localhost:3000/api/queue/process", { method: "POST" });
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}
poll().catch(console.error);
