---
Task ID: 1
Agent: Main Agent
Task: Fix routing redirect loop and admin login bypass for ProspectIQ

Work Log:
- Diagnosed ERR_TOO_MANY_REDIRECTS on /auth/login page
- Found root cause 1: Auth callback route used `request.url` which resolved to `http://0.0.0.0:3000` in standalone mode, creating unreachable redirect URLs through the Caddy reverse proxy
- Found root cause 2: Admin login bypass was gated behind `isDemoMode && isAdminEmail()`, but Supabase env vars ARE set (making isDemoMode=false), so the admin bypass was dead code
- Found root cause 3: Container's HOSTNAME env var is set to container ID, causing Next.js standalone to try binding to an invalid hostname
- Fixed auth callback route (`src/app/auth/callback/route.ts`) to use `X-Forwarded-Host` and `X-Forwarded-Proto` headers from Caddy to construct proper redirect URLs
- Fixed login form (`src/app/auth/login/login-form.tsx`) to allow admin bypass regardless of demo mode
- Fixed `handleAuthCallback` in `src/lib/supabase/server.ts` to return success in demo mode
- Added `hasSupabaseEnv()` to `src/lib/env.ts`
- Created `scripts/patch-standalone.py` to fix HOSTNAME env var collision in containers
- Updated `package.json` build script to auto-apply standalone patch
- Verified all 6 routes return HTTP 200 through Caddy proxy
- Verified auth callback redirect no longer contains `0.0.0.0`

Stage Summary:
- All routes: /, /auth/login, /auth/signup, /auth/forgot-password, /auth/verify-email, /dashboard → 200
- Auth callback redirect: `Location: http://localhost/dashboard` (was `http://0.0.0.0:3000/dashboard`)
- Admin email benedict.mukalula@gmail.com can now log in via bypass regardless of Supabase connection status
- Files changed: src/app/auth/callback/route.ts, src/app/auth/login/login-form.tsx, src/lib/supabase/server.ts, src/lib/env.ts, scripts/patch-standalone.py, package.json
