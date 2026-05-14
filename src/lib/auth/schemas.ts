import { z } from "zod";

/** Login form schema */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/** Signup form schema */
export const signupSchema = z.object({
  company: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name is too long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export type SignupFormData = z.infer<typeof signupSchema>;

/** Forgot password form schema */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/** Verify email form schema */
export const verifyEmailSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  code: z
    .string()
    .min(1, "Verification code is required")
    .length(6, "Verification code must be 6 digits"),
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
