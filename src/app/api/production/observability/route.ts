import { NextResponse } from "next/server";
import { computeDeliveryHealth } from "../production/delivery-observability";

export async function GET() {
  // Placeholder until DB aggregation is wired
  const stats = {
    sent: 10,
    delivered: 9,
    opened: 5,
    clicked: 2,
    bounced: 1,
  };

  const health = computeDeliveryHealth(stats);

  return NextResponse.json({
    success: true,
    stats,
    health,
  });
}
