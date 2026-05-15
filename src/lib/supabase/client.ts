import { createClient } from "@supabase/supabase-js";

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const isDemoMode = !isSupabaseConfigured;

const demoError = {
  message: "Demo mode: Supabase is not connected yet.",
};

const demoAuthClient = {
  signInWithPassword: async () => ({
    data: null,
    error: demoError,
  }),

  signUp: async () => ({
    data: null,
    error: demoError,
  }),

  resetPasswordForEmail: async () => ({
    data: null,
    error: demoError,
  }),

  verifyOtp: async () => ({
    data: null,
    error: demoError,
  }),

  signOut: async () => ({
    error: null,
  }),

  getSession: async () => ({
    data: { session: null },
    error: null,
  }),

  getUser: async () => ({
    data: { user: null },
    error: null,
  }),
};

const supabaseClient = isSupabaseConfigured
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  : null;

export const supabaseAuth = supabaseClient
  ? supabaseClient.auth
  : demoAuthClient;

export function createBrowserSupabaseClient() {
  return supabaseClient;
}
