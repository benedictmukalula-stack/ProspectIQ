"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Mail,
  Loader2,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { isDemoMode, supabaseAuth } from "../lib/supabase/client";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "../lib/auth/schemas";
import { DemoBanner } from "../components/prospectiq/auth/demo-banner";

export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    if (isDemoMode) return;
    setServerError(null);

    const result = await supabaseAuth.resetPasswordForEmail(data.email);

    if (result.error) {
      setServerError(result.error.message);
    } else {
      setSubmittedEmail(data.email);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Reset password
        </CardTitle>
        <CardDescription>
          {submittedEmail
            ? "Check your inbox for a reset link"
            : "Enter your email and we'll send you a reset link"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submittedEmail ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
            <p className="text-sm text-zinc-400">
              We sent a password reset link to{" "}
              <span className="font-medium text-zinc-200">
                {submittedEmail}
              </span>
              . Please check your inbox and follow the instructions.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/auth/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <DemoBanner />

            {serverError && (
              <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-xs leading-relaxed text-destructive/90">
                  {serverError}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    disabled={isDemoMode || isSubmitting}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isDemoMode || isSubmitting}>
                {isDemoMode
                  ? "Password reset disabled in demo mode"
                  : isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
              </Button>

              {isDemoMode && (
                <p className="text-center text-xs text-zinc-500">
                  Connect Supabase to enable password reset.
                </p>
              )}
            </form>
          </>
        )}
      </CardContent>
      {!submittedEmail && (
        <CardFooter className="justify-center">
          <p className="text-center text-sm text-zinc-500">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-zinc-300 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
