/**
 * Demo session management using sessionStorage.
 *
 * This provides a lightweight client-side auth flag so the dashboard knows
 * the user has "logged in" during demo mode, without requiring Supabase.
 * sessionStorage is scoped to the tab and cleared when the tab closes.
 *
 * IMPORTANT: This file must ONLY be imported from client components.
 * sessionStorage is not available during SSR.
 */
const DEMO_SESSION_KEY = "prospectiq_demo_session";
/**
 * Store a demo session in sessionStorage.
 * Safe to call — no-ops on the server.
 */
export function setDemoSession(email) {
    if (typeof window === "undefined")
        return;
    try {
        const session = {
            email,
            loggedAt: new Date().toISOString(),
        };
        window.sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
    }
    catch {
        // sessionStorage unavailable (e.g. private browsing quota) — ignore
    }
}
/**
 * Retrieve the current demo session, or null if none exists.
 */
export function getDemoSession() {
    if (typeof window === "undefined")
        return null;
    try {
        const raw = window.sessionStorage.getItem(DEMO_SESSION_KEY);
        if (!raw)
            return null;
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
/**
 * Check whether an active demo session exists.
 */
export function hasDemoSession() {
    return getDemoSession() !== null;
}
/**
 * Clear the demo session (e.g. on sign out).
 */
export function clearDemoSession() {
    if (typeof window === "undefined")
        return;
    try {
        window.sessionStorage.removeItem(DEMO_SESSION_KEY);
    }
    catch {
        // ignore
    }
}
