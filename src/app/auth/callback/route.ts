import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { handleAuthCallback } from "@/lib/supabase/server";

/**
 * Build a redirect URL using forwarded headers.
 * In standalone mode, request.url and request.nextUrl resolve to
 * 0.0.0.0:3000 which is not reachable from the browser. We use
 * X-Forwarded-Host / Host headers to construct the correct public URL.
 */
function buildRedirectUrl(request: NextRequest, path: string): string {
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "localhost:3000";
  const proto =
    request.headers.get("x-forwarded-proto") ||
    (request.headers.get("host")?.includes("localhost") ? "http" : "https");
  return `${proto}://${host}${path}`;
}

export async function GET(request: NextRequest) {
  const { success, error } = await handleAuthCallback(request);

  if (!success || error) {
    const errorParam = encodeURIComponent(error ?? "Callback failed");
    return NextResponse.redirect(
      buildRedirectUrl(request, `/auth/login?error=${errorParam}`)
    );
  }

  return NextResponse.redirect(buildRedirectUrl(request, "/dashboard"));
}
