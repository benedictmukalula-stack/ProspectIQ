import { NextResponse } from "next/server"
import { computeDeliveryHealth } from "../production/delivery-observability"
import { evaluateProtectionActions } from "../production/deliverability-protection"

export async function GET() {
  try {
    // SAFE DEFAULTS (prevents crashes)
    const stats = {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
    }

    const health = computeDeliveryHealth(stats)
    const actions = evaluateProtectionActions(health)

    return NextResponse.json({
      success: true,
      stats,
      health,
      actions,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
