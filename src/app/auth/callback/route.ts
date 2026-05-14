import { handleAuthCallback } from "@/lib/supabase/server";

/**
 * GET /auth/callback
 *
 * Handles the OAuth callback from Supabase (and demo-mode passthrough).
 *
 * CRITICAL: In Next.js standalone mode behind a reverse proxy, `request.url`
 * resolves to `http://0.0.0.0:3000/...` which is unreachable from the browser.
 * We use `NextResponse.redirect(new URL(path, request.url))` BUT we detect
 * the 0.0.0.0 case and fall back to a relative-URL redirect instead.
 *
 * A bare relative path in `NextResponse.redirect()` is treated as a relative
 * URL by the browser, which resolves against the current page origin — exactly
 * what we want when behind a proxy.
 */
export async function GET(request: Request) {
  const { success, error } = await handleAuthCallback(request);

  const targetPath = success ? "/dashboard" : `/auth/login?error=${encodeURIComponent(error ?? "Callback failed")}`;

  // Detect if request.url is the broken internal address (0.0.0.0).
  // If so, use a relative redirect so the browser resolves against its own origin.
  const requestUrl = request.url;
  const usesInternalOrigin =
    requestUrl.includes("0.0.0.0") ||
    requestUrl.includes("127.0.0.1") ||
    requestUrl.includes("localhost");

  // Check forwarded headers for the real public origin (Caddy sets these).
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";

  if (usesInternalOrigin && forwardedHost) {
    // Construct the public URL from forwarded headers.
    const hostOnly = forwardedHost.split(":")[0];
    const publicOrigin = `${forwardedProto}://${hostOnly}`;
    const redirectUrl = new URL(targetPath, publicOrigin);
    return Response.redirect(redirectUrl, 307);
  }

  if (usesInternalOrigin) {
    // No forwarded headers and internal origin — use a bare relative redirect.
    // NextResponse.redirect with a relative path works in Next.js route handlers.
    return Response.redirect(new URL(targetPath, requestUrl), 307);
  }

  // Normal case: request.url already has the correct public origin.
  return Response.redirect(new URL(targetPath, requestUrl), 307);
}
