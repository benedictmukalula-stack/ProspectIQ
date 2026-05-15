"use client";

import { useState } from "react";
import { isDemoMode, supabaseAuth } from "@/lib/supabase/client";

export default function SignupForm() {
  const [workspaceName, setWorkspaceName] = useState("Knowledge Camp Global");
  const [email, setEmail] = useState("benedict.mukalula@gmail.com");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setServerError("");
    setLoading(true);

    if (isDemoMode) {
      setLoading(false);
      setServerError("Demo mode: Supabase is not connected yet.");
      return;
    }

    const result = await supabaseAuth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          workspace_name: workspaceName,
        },
      },
    });

    setLoading(false);

    if (result.error) {
      setServerError(result.error.message);
      return;
    }

    setMessage("Account created. Check your email for the confirmation link.");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm text-slate-400">ProspectIQ</p>

        <h1 className="mt-3 text-3xl font-bold">Create your account</h1>

        <p className="mt-2 text-slate-400">
          Start your ProspectIQ workspace.
        </p>

        {isDemoMode && (
          <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
            Demo mode: Supabase is not connected yet.
          </div>
        )}

        {serverError && (
          <div className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">
            {serverError}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            {message}
          </div>
        )}

        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-400">
              Workspace Name
            </label>
            <input
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
              required
            />
          </div>

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
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-500 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <a href="/auth/login" className="text-blue-300">
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}
