---
Task ID: 1
Agent: Main Agent
Task: Restore Phase 2 auth UI — login, signup, forgot-password, verify-email pages

Work Log:
- Audited all existing auth files: env.ts, admin.ts, supabase/client.ts, auth/schemas.ts, auth/demo-session.ts, demo-banner.tsx — all already well-structured
- Identified 3 issues to fix:
  1. Login form: Zod loginSchema requires password min(8), blocking admin bypass in demo mode (bypass runs after validation). Fix: added demoLoginSchema with relaxed password constraint (min 1 char only)
  2. Signup form: used router.push (soft navigation) which fails behind Caddy proxy. Fix: replaced with window.location.assign()
  3. Login page.tsx was still a placeholder. Fix: wired to LoginForm component
- Updated auth layout.tsx with dark theme background
- Updated dashboard placeholder to show "Phase 3 coming next"
- Clean build (rm -rf .next, lint, build) — all passed
- Started server with nohup, verified all 6 routes return 200 with correct content

Stage Summary:
- All Phase 2 auth pages restored: /auth/login, /auth/signup, /auth/forgot-password, /auth/verify-email
- Demo mode banner shows when Supabase env vars missing
- Admin bypass (benedict.mukalula@gmail.com) works in demo mode with any password
- No middleware.ts, no auto-redirects, no redirect loops, no blank screens
- All routes verified via both direct (port 3000) and Caddy proxy (port 81)
