/**
 * GET /auth/callback
 *
 * Phase 2: Neutralized. Returns a simple page telling the user
 * the callback was received. No redirects.
 *
 * When Phase 3 implements real Supabase auth, this route will
 * exchange the auth code for a session and then redirect once to /dashboard.
 */
export async function GET(_request: Request) {
  return new Response(
    `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Auth Callback</title></head>
<body style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#09090b;color:#fff;font-family:system-ui,sans-serif;margin:0">
<div style="text-align:center">
  <h1 style="font-size:24px;font-weight:700;margin-bottom:8px">Auth callback received</h1>
  <p style="color:#a1a1aa">You can close this tab and return to the app.</p>
  <a href="/auth/login" style="color:#10b981;margin-top:16px;display:inline-block">Go to Sign In</a>
</div>
</body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
