import Link from "next/link";
import { ProspectIQLogo } from "@/components/prospectiq/logo";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] px-4 py-12">
      {/* Subtle background grid */}
      <div
        className="pointer-events-none fixed inset-0 landing-grid"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 landing-glow"
        aria-hidden="true"
      />

      <div className="relative z-10 mb-8">
        <Link href="/">
          <ProspectIQLogo variant="light" />
        </Link>
      </div>

      <div className="relative z-10">{children}</div>

      <p className="relative z-10 mt-8 text-center text-xs text-zinc-600">
        &copy; {new Date().getFullYear()} ProspectIQ, Inc. All rights reserved.
      </p>
    </div>
  );
}
