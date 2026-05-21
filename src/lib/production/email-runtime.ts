import { selectEmailProvider } from "@/lib/production/provider-orchestration-engine"

export type ProductionEmailPayload = {
  to: string
  subject: string
  body: string
  from?: string
  allowProductionSend?: boolean
}

export async function sendProductionEmail(payload: ProductionEmailPayload) {
  const selectedProvider = selectEmailProvider()

  if (!payload.allowProductionSend || selectedProvider.provider === "mock") {
    return {
      success: true,
      provider: selectedProvider.provider,
      mode: "simulation",
      messageId: `sim_${Date.now()}`,
      detail:
        "Email simulated. Set allowProductionSend=true and configure provider credentials to send live email.",
    }
  }

  if (selectedProvider.provider === "resend") {
    const apiKey = process.env.RESEND_API_KEY
    const from = payload.from || process.env.RESEND_FROM_EMAIL

    if (!apiKey || !from) {
      return {
        success: false,
        provider: "resend",
        mode: "production",
        error: "Missing RESEND_API_KEY or RESEND_FROM_EMAIL",
      }
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: payload.to,
        subject: payload.subject,
        text: payload.body,
      }),
    })

    const json = await response.json().catch(() => ({}))

    if (!response.ok) {
      return {
        success: false,
        provider: "resend",
        mode: "production",
        error: json?.message || "Resend send failed",
        response: json,
      }
    }

    return {
      success: true,
      provider: "resend",
      mode: "production",
      messageId: json?.id,
      response: json,
    }
  }

  return {
    success: false,
    provider: selectedProvider.provider,
    mode: "production",
    error: `${selectedProvider.provider} runtime is configured but not implemented yet.`,
  }
}
