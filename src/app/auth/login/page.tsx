import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "ProspectIQ - Sign In",
  description: "Sign in to your ProspectIQ account to access your B2B lead intelligence dashboard.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 py-12">
      <LoginForm />
    </div>
  );
}
