export async function runAgentRuntimeCycle() {
  return { status: "idle", lastRun: new Date().toISOString(), message: "Agent runtime stub" };
}
export const agentStatus = "stub";
export const agentConfig = { enabled: false, interval: 0 };
