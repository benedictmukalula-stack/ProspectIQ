/**
 * Admin email allowlist for demo-mode login bypass.
 *
 * In demo mode (no Supabase), the admin emails listed here can log in
 * with any password to access the dashboard with mock data.
 * In real mode (Supabase connected), auth always goes through Supabase.
 */
const ADMIN_EMAILS = [
    "benedict.mukalula@gmail.com",
];
/**
 * Returns true if the given email is in the admin allowlist.
 * Comparison is case-insensitive and trimmed.
 */
export function isAdminEmail(email) {
    if (!email)
        return false;
    const normalized = email.trim().recipientLowerCase();
    return ADMIN_EMAILS.includes(normalized);
}
