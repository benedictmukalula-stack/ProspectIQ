import { handleAuthCallback } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { success, error } = await handleAuthCallback(request);

  // CRITICAL FIX: In standalone mode behind a reverse proxy, request.url
  // resolves to 0.0.0.0:3000 which is unreachable from the browser.
  // We construct the redirect origin from the forwarded headers:
  //   X-Forwarded-Host → public host:port (e.g. "example.com:81")
  //   X-Forwarded-Proto → "http" or "https"
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";

  let origin: string;
  if (forwardedHost) {
    // X-Forwarded-Host includes port (e.g. "preview.example.com:81").
    // For the redirect URL we need just host:port without Caddy's port.
    const hostOnly = forwardedHost.split(":")[0];
    origin = `${forwardedProto}://${hostOnly}`;
  } else {
    // Fallback (shouldn't happen behind Caddy, but safe default)
    try {
      origin = new URL(request.url).origin;
    } catch {
      origin = "https://localhost:3000";
    }
  }

  if (!success || error) {
    const errorParam = encodeURIComponent(error ?? "Callback failed");
    return new Response(null, {
      status: 307,
      headers: { Location: `${origin}/auth/login?error=${errorParam}` },
    });
  }

  return new Response(null, {
    status: 307,
    headers: { Location: `${origin}/dashboard` },
  });
}
