/**
 * Centralized environment variable validation.
 *
 * When Supabase env vars are missing, the app runs in DEMO MODE.
 * All auth operations return mock responses with clear messaging.
 */

const envSchema = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
};

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

/** True when Supabase is properly configured. */
export const isSupabaseConfigured =
  isNonEmpty(envSchema.NEXT_PUBLIC_SUPABASE_URL) &&
  isValidUrl(envSchema.NEXT_PUBLIC_SUPABASE_URL) &&
  isNonEmpty(envSchema.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/** True when Supabase is NOT configured — app runs in demo mode. */
export const isDemoMode = !isSupabaseConfigured;

/** Safe access to validated env values. */
export const env = {
  supabaseUrl: envSchema.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: envSchema.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: envSchema.SUPABASE_SERVICE_ROLE_KEY,
} as const;
