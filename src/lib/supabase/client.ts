/**
 * Supabase-ready client stub.
 *
 * Replace the mock implementation with real Supabase initialization
 * when connecting to a live backend:
 *
 *   import { createClient } from "@supabase/supabase-js";
 *   export const supabase = createClient(url, anonKey);
 */

interface SupabaseStub {
  auth: {
    signUp: (params: { email: string; password: string }) => Promise<{ error: null | Error }>;
    signIn: (params: { email: string; password: string }) => Promise<{ error: null | Error }>;
    signOut: () => Promise<{ error: null | Error }>;
  };
}

const mockAuth = {
  async signUp(_params: { email: string; password: string }) {
    return { error: null as null };
  },
  async signIn(_params: { email: string; password: string }) {
    return { error: null as null };
  },
  async signOut() {
    return { error: null as null };
  },
};

export const supabase: SupabaseStub = {
  auth: mockAuth,
};
