/**
 * Browser-side Supabase client.
 *
 * In demo mode (no env vars), returns a stub that simulates auth operations
 * with a clear delay and demo-mode error message — never a fake silent success.
 */

import { isDemoMode, isSupabaseConfigured, env } from "@/lib/env";

interface AuthResponse {
  error: { message: string } | null;
  data: { user: { email: string } | null };
}

interface DemoAuthResult {
  error: { message: string } | null;
}

function demoResponse(): Promise<DemoAuthResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        error: {
          message:
            "Demo mode: Supabase is not connected yet. Connect your Supabase project to enable real authentication.",
        },
      });
    }, 800);
  });
}

const demoAuth = {
  signUp: demoResponse,
  signInWithPassword: demoResponse,
  resetPasswordForEmail: demoResponse,
  verifyOtp: demoResponse,
  getSession: () =>
    Promise.resolve({
      data: { session: null },
      error: null,
    }),
};

async function createRealClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(env.supabaseUrl, env.supabaseAnonKey);
}

let _realClient: Awaited<ReturnType<typeof createRealClient>> | null = null;

async function getRealClient() {
  if (!_realClient) {
    _realClient = await createRealClient();
  }
  return _realClient;
}

/**
 * Supabase auth interface used by auth forms.
 * In demo mode, every operation returns a clear error.
 */
export const supabaseAuth = isDemoMode
  ? demoAuth
  : {
      async signUp(params: {
        email: string;
        password: string;
        options?: { data?: Record<string, string> };
      }): Promise<AuthResponse> {
        const client = await getRealClient();
        return client.auth.signUp(params) as Promise<AuthResponse>;
      },
      async signInWithPassword(params: {
        email: string;
        password: string;
      }): Promise<AuthResponse> {
        const client = await getRealClient();
        return client.auth.signInWithPassword(
          params
        ) as Promise<AuthResponse>;
      },
      async resetPasswordForEmail(email: string): Promise<AuthResponse> {
        const client = await getRealClient();
        return client.auth.resetPasswordForEmail(email) as Promise<AuthResponse>;
      },
      async verifyOtp(params: {
        email: string;
        token: string;
        type: string;
      }): Promise<AuthResponse> {
        const client = await getRealClient();
        return client.auth.verifyOtp(
          params as Parameters<typeof client.auth.verifyOtp>[0]
        ) as Promise<AuthResponse>;
      },
      async getSession() {
        const client = await getRealClient();
        return client.auth.getSession();
      },
    };

export { isDemoMode, isSupabaseConfigured };
