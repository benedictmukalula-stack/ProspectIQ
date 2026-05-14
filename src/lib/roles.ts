/**
 * Role and access-control utilities.
 *
 * Uses an environment-variable allowlist — no database, no middleware needed.
 * The admin email is stored in NEXT_PUBLIC_ADMIN_EMAIL so both server and
 * client code can check it at build / runtime.
 */

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Returns true if the given email has full admin access.
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

/**
 * Returns the role string for a given email.
 * Only "admin" and "member" exist for now — expand later.
 */
export function getRole(email: string | null | undefined): "admin" | "member" {
  return isAdmin(email) ? "admin" : "member";
}
