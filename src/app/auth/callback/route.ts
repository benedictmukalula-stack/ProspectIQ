import { handleAuthCallback } from "@/lib/supabase/server";

/**
 * GET /auth/callback
 *
 * Handles the OAuth callback from Supabase.
 * - On success: redirects once to /dashboard
 * - On error: redirects once to /auth/login?error=...
 *
 * CRITICAL: The URL construction handles the Next.js standalone mode issue
 * where request.url resolves to http://0.0.0.0:3000 internally.
 * We use X-Forwarded-* headers (set by Caddy) to build the public URL.
 * If those headers are missing, we fall back to the request URL.
 */
export async function GET(request: Request) {
  const { success, error } = await handleAuthCallback(request);

  const targetPath = success
    ? "/dashboard"
    : `/auth/login?error=${encodeURIComponent(error ?? "Callback failed")}`;

  // Build the redirect URL using forwarded headers when available.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";

  let redirectUrl: URL;

  if (forwardedHost) {
    // Public-facing URL via proxy headers
    const hostOnly = forwardedHost.split(":")[0];
    const origin = `${forwardedProto}://${hostOnly}`;
    redirectUrl = new URL(targetPath, origin);
  } else {
    // Direct access (no proxy) — use request URL as-is
    redirectUrl = new URL(targetPath, request.url);
  }

  return Response.redirect(redirectUrl, 307);
}
