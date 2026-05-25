export function mapToEmailProtection(p: any) {
  return {
    throttle: Boolean(p?.suppressSending),
    switchProvider: (p?.riskLevel === "high" || p?.mode === "failover"),
  };
}
