"use client";

import { useState } from "react";
import { isDemoMode, supabaseAuth } from "../lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("benedict.mukalula@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setServerError("");
    setLoading(true);

    if (isDemoMode) {
      setLoading(false);
      setServerError("Demo mode: Supabase is not connected yet.");
      return;
    }

    const result = await supabaseAuth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (result.error) {
      setServerError(result.error.message);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm text-slate-400">ProspectIQ</p>

        <h1 className="mt-3 text-3xl font-bold">Welcome back</h1>

        <p className="mt-2 text-slate-400">
          Sign in to your ProspectIQ workspace.
        </p>

        {serverError && (
          <div className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">
            {serverError}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-400">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-400">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-500 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don’t have an account?{" "}
          <a href="/auth/signup" className="text-blue-300">
            Create account
          </a>
        </p>
      </div>
    </main>
  );
}
