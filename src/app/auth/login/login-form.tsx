"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { supabaseAuth, isDemoMode, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  loginSchema,
  type LoginFormData,
} from "@/lib/auth/schemas";
import { isAdminEmail } from "@/lib/admin";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Admin bypass runs BEFORE zod validation so any password works.
  // Uses native hard navigation (window.location) instead of Next.js
  // soft router.push, which can fail silently behind reverse proxies.
  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    const formData = new FormData(e.currentTarget);
    const rawEmail = formData.get("email") as string | null;
    const normalizedEmail = (rawEmail ?? "").trim().toLowerCase();

    if (isAdminEmail(normalizedEmail)) {
      window.location.href = "/dashboard";
      return;
    }

    // Non-admin: fall through to react-hook-form + zod validation
    handleSubmit(onSubmit)(e);
  }

  async function onSubmit(data: LoginFormData) {
    setServerError(null);
    const normalizedEmail = data.email.trim().toLowerCase();

    // In real mode, attempt Supabase auth
    const result = await supabaseAuth.signInWithPassword({
      email: normalizedEmail,
      password: data.password,
    });

    if (result.error) {
      setServerError(result.error.message);
    } else {
      window.location.href = "/dashboard";
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription>
          Sign in to your ProspectIQ account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(isDemoMode || isSupabaseConfigured) && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3.5 py-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p className="text-xs leading-relaxed text-amber-200/80">
              <span className="font-semibold text-amber-300">{isDemoMode ? "Demo mode:" : "Note:"}</span>{" "}
              {isDemoMode
                ? "Supabase is not connected. Admin users can still log in to explore the dashboard with mock data."
                : "Admin users can log in with any password to access the dashboard."}
            </p>
          </div>
        )}

        {serverError && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-xs leading-relaxed text-destructive/90">
              {serverError}
            </p>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="login-email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                disabled={isSubmitting}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-zinc-500 hover:text-zinc-300 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isSubmitting}
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-center text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-zinc-300 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
