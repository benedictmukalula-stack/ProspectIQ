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
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { isDemoMode, supabaseAuth } from "../lib/supabase/client";
import {
  verifyEmailSchema,
  type VerifyEmailFormData,
} from "../lib/auth/schemas";
import { DemoBanner } from "../components/prospectiq/auth/demo-banner";

export function VerifyEmailForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email: "", code: "" },
  });

  async function onSubmit(data: VerifyEmailFormData) {
    if (isDemoMode) return;
    setServerError(null);

    const result = await supabaseAuth.verifyOtp({
      email: data.email,
      token: data.code,
      type: "signup",
    });

    if (result.error) {
      setServerError(result.error.message);
    } else {
      setVerified(true);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Verify your email
        </CardTitle>
        <CardDescription>
          {verified
            ? "Email verified successfully"
            : "Enter the verification code sent to your email"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {verified ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
            <p className="text-sm text-zinc-400">
              Your email has been verified. You can now sign in to your
              ProspectIQ account and start exploring.
            </p>
            <Button className="w-full" asChild>
              <Link href="/auth/login">Continue to Sign In</Link>
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
                <Label htmlFor="verify-email">Email address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="verify-email"
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

              <div className="space-y-2">
                <Label htmlFor="verify-code">Verification code</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="verify-code"
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    autoComplete="one-time-code"
                    disabled={isDemoMode || isSubmitting}
                    {...register("code")}
                  />
                </div>
                {errors.code && (
                  <p className="text-xs text-destructive">
                    {errors.code.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isDemoMode || isSubmitting}>
                {isDemoMode
                  ? "Email verification disabled in demo mode"
                  : isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Email"
                  )}
              </Button>

              {isDemoMode && (
                <p className="text-center text-xs text-zinc-500">
                  Connect Supabase to enable email verification.
                </p>
              )}
            </form>
          </>
        )}
      </CardContent>
      {!verified && (
        <CardFooter className="justify-center">
          <Link
            href="/auth/login"
            className="text-sm text-zinc-500 hover:text-zinc-300 hover:underline"
          >
            Back to sign in
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
