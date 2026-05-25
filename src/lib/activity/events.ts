export async function createActivityEvent(payload: any = {}) {
  // TODO: wire to DB later
  console.log("📊 Activity Event:", payload?.title || "event");
  return true;
}
