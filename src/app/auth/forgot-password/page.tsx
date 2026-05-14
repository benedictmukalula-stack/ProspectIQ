import type { Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "ProspectIQ - Reset Password",
  description: "Reset your ProspectIQ account password. We'll send a reset link to your email.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
