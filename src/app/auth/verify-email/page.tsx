import type { Metadata } from "next";
import { VerifyEmailForm } from "./verify-email-form";

export const metadata: Metadata = {
  title: "ProspectIQ - Verify Email",
  description: "Verify your email address to complete your ProspectIQ account setup.",
};

export default function VerifyEmailPage() {
  return <VerifyEmailForm />;
}
