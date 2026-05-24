/**
 * Server-only environment variables.
 *
 * NEVER import this file from a "use client" component.
 * The service role key has admin access — it must stay server-side only.
 */
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
export const serverEnv = {
    supabaseServiceRoleKey,
};
