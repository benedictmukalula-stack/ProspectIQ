import type { Metadata } from "next";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "ProspectIQ - Sign Up",
  description: "Create your ProspectIQ account and start your 14-day free trial. AI-powered B2B lead intelligence.",
};

export default function SignupPage() {
  return <SignupForm />;
}
