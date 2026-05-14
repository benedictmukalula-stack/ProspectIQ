/**
 * Server-side Supabase client stub.
 *
 * Ready for real implementation when Supabase is connected.
 * Server components and route handlers should import from here.
 *
 * Usage (when Supabase is connected):
 *   import { createServerClient } from "@supabase/ssr";
 *   import { cookies } from "next/headers";
 *
 *   const supabase = createServerClient(url, serviceRoleKey, {
 *     cookies: { getAll(), setAll() },
 *   });
 */

import { isDemoMode } from "@/lib/env";
import { serverEnv } from "@/lib/env-server";

export { isDemoMode };

export const serverSupabase = isDemoMode
  ? null
  : "READY_TO_CONNECT";

/**
 * Helper for auth callback route handler.
 * When Supabase is connected, this will exchange the auth code for a session.
 */
export async function handleAuthCallback(
  _request: Request
): Promise<{ success: boolean; error: string | null }> {
  if (isDemoMode) {
    return {
      success: false,
      error:
        "Demo mode: Supabase is not connected yet. Connect your Supabase project to enable auth callbacks.",
    };
  }

  // Real implementation when connected:
  // const { searchParams } = new URL(request.url);
  // const code = searchParams.get("code");
  // if (code) {
  //   const supabase = createServerClient(url, serverEnv.supabaseServiceRoleKey, { ... });
  //   await supabase.auth.exchangeCodeForSession(code);
  // }
  return { success: true, error: null };
}
