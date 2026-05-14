/**
 * Public environment variables.
 *
 * Safe to import from any component (server or client).
 * Only NEXT_PUBLIC_ prefixed variables are exposed to the browser.
 * The service role key lives in env-server.ts — never imported by client code.
 */

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True when Supabase is properly configured. */
export const isSupabaseConfigured =
  isNonEmpty(supabaseUrl) &&
  isValidUrl(supabaseUrl) &&
  isNonEmpty(supabaseAnonKey);

/** True when Supabase is NOT configured — app runs in demo mode. */
export const isDemoMode = !isSupabaseConfigured;

/** Alias for isSupabaseConfigured — checks if Supabase env vars are present. */
export function hasSupabaseEnv(): boolean {
  return isSupabaseConfigured;
}

const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";

/** Public env values — safe for client consumption. */
export const env = {
  supabaseUrl,
  supabaseAnonKey,
  adminEmail,
} as const;
