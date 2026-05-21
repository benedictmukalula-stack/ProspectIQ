import { NextResponse } from "next/server"

import {
  getProviderStatus,
  selectEmailProvider,
} from "@/lib/production/provider-orchestration-engine"

export async function GET() {
  const providers = getProviderStatus()
  const selected = selectEmailProvider()

  return NextResponse.json({
    success: true,
    selectedProvider: selected,
    providers,
    productionReady: providers.some(
      (provider) =>
        provider.provider !== "mock" && provider.mode === "production-ready"
    ),
  })
}
