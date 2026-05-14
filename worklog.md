---
Task ID: 1
Agent: main
Task: Debug blank preview screen

Work Log:
- Read root layout — clean (no providers, no auth, just html/body/children/Toaster)
- Read all landing page imports — found window/document usage only in useEffect hooks (safe)
- Checked use-toast hook — module-level state but SSR safe
- Set minimal safe page.tsx (plain HTML with inline styles) and stripped layout.tsx (removed Toaster)
- Built and tested: minimal page returns 200 with visible content
- Added Toaster back: still works (200, content renders)
- Restored full landing page with all 10 components: builds clean, all routes 200
- Tested all 3 routes: / = 133KB, /auth/login = 19KB, /dashboard = 33KB
- No component crashes found — all landing components render correctly

Stage Summary:
- Blank screen was NOT caused by a code crash or broken import
- All components render correctly — landing page (133KB), login (19KB), dashboard (33KB)
- The "blank preview" is caused by the standalone server process dying between tool calls
- Server process survives when started inline in the same bash session, but gets killed otherwise
- This is a container process lifecycle issue, not a code bug
