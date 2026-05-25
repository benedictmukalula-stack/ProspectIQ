import { NextResponse } from "next/server";
import { execSync } from "child_process";

export async function GET() {
  let workerStatus = "unknown";
  let lastRun = null;

  try {
    // Check if queue-worker is running via PM2
    const output = execSync("pm2 jlist", { encoding: "utf8" });
    const processes = JSON.parse(output);
    const worker = processes.find((p: any) => p.name === "queue-worker");
    if (worker && worker.pm2_env?.status === "online") {
      workerStatus = "online";
      lastRun = worker.pm2_env?.pm_uptime || null;
    } else {
      workerStatus = "offline";
    }
  } catch (err) {
    // If PM2 not available, fallback to mock
    workerStatus = "idle (PM2 not found)";
  }

  return NextResponse.json({
    status: workerStatus,
    lastRun: lastRun ? new Date(lastRun).toISOString() : null,
    message: workerStatus === "online" ? "Queue worker is active" : "Queue worker not running",
  });
}
