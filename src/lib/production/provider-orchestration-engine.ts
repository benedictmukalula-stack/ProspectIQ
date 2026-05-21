export type EmailProvider = "mock" | "resend" | "postmark" | "sendgrid"

export type ProviderStatus = {
  provider: EmailProvider
  configured: boolean
  mode: "simulation" | "production-ready" | "missing-config"
  requiredEnv: string[]
}

const PROVIDERS: Record<EmailProvider, string[]> = {
  mock: [],
  resend: ["RESEND_API_KEY"],
  postmark: ["POSTMARK_SERVER_TOKEN"],
  sendgrid: ["SENDGRID_API_KEY"],
}

export function getProviderStatus(): ProviderStatus[] {
  return Object.entries(PROVIDERS).map(([provider, envKeys]) => {
    const configured = envKeys.every((key) => Boolean(process.env[key]))

    return {
      provider: provider as EmailProvider,
      configured: provider === "mock" ? true : configured,
      mode:
        provider === "mock"
          ? "simulation"
          : configured
            ? "production-ready"
            : "missing-config",
      requiredEnv: envKeys,
    }
  })
}

export function selectEmailProvider(preferred?: EmailProvider) {
  const statuses = getProviderStatus()

  if (preferred) {
    const selected = statuses.find((item) => item.provider === preferred)
    if (selected?.configured) return selected
  }

  return (
    statuses.find(
      (item) => item.provider !== "mock" && item.configured
    ) || statuses.find((item) => item.provider === "mock")!
  )
}
