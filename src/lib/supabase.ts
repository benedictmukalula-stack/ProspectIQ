import { createClient } from "@supabase/supabase-js";

const getEnv = () => ({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

export const getSupabase = () => {
  const { url, anonKey } = getEnv();
  if (!url || !anonKey) {
    throw new Error(
      `Supabase configuration missing. URL: ${!!url}, ANON_KEY: ${!!anonKey}. Check your .env.local file and restart the server.`
    );
  }
  return createClient(url, anonKey);
};

export const getSupabaseAdmin = () => {
  const { url, serviceKey, anonKey } = getEnv();
  if (!url) throw new Error("Supabase URL missing");
  if (serviceKey) return createClient(url, serviceKey);
  console.warn("SUPABASE_SERVICE_ROLE_KEY not set – using anon key for admin client (may cause permission errors)");
  return createClient(url, anonKey);
};

// For convenience, export a singleton that throws on missing keys
export const supabase = getSupabase();
export const supabaseAdmin = getSupabaseAdmin();
