"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#09090b",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#18181b",
          borderRadius: "12px",
          padding: "32px",
          border: "1px solid #27272a",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#fff",
              margin: "0 0 6px 0",
            }}
          >
            Welcome back
          </h1>
          <p style={{ fontSize: "14px", color: "#71717a", margin: 0 }}>
            Sign in to your ProspectIQ account
          </p>
        </div>

        {/* Demo mode banner */}
        <div
          style={{
            background: "rgba(245, 158, 11, 0.06)",
            border: "1px solid rgba(245, 158, 11, 0.15)",
            borderRadius: "8px",
            padding: "12px 14px",
            marginBottom: "20px",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              color: "#fbbf24",
              fontWeight: 600,
              margin: "0 0 2px 0",
            }}
          >
            Demo Mode
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "#a3a3a3",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Supabase is not connected. Auth is visual only — no real login occurs.
          </p>
        </div>

        {/* Admin note */}
        <div
          style={{
            background: "rgba(16, 185, 129, 0.06)",
            border: "1px solid rgba(16, 185, 129, 0.15)",
            borderRadius: "8px",
            padding: "12px 14px",
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "#6ee7b7",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            <span style={{ fontWeight: 600 }}>Admin email:</span>{" "}
            benedict.mukalula@gmail.com
          </p>
        </div>

        {/* Success message */}
        {submitted && (
          <div
            style={{
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: "8px",
              padding: "12px 14px",
              marginBottom: "20px",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                color: "#34d399",
                fontWeight: 500,
                margin: 0,
              }}
            >
              Login form submitted successfully.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Email */}
          <div>
            <label
              htmlFor="login-email"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "#d4d4d8",
                marginBottom: "6px",
              }}
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSubmitted(false);
              }}
              autoComplete="email"
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "#27272a",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="login-password"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "#d4d4d8",
                marginBottom: "6px",
              }}
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setSubmitted(false);
              }}
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "#27272a",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              background: "#059669",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              marginTop: "4px",
            }}
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#52525b",
            marginTop: "20px",
            marginBottom: 0,
          }}
        >
          Don&apos;t have an account?{" "}
          <span style={{ color: "#a1a1aa" }}>Sign up</span>
        </p>
      </div>
    </main>
  );
}
