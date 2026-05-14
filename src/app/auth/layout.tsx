import Link from "next/link";
import { ProspectIQLogo } from "@/components/prospectiq/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <div className="mb-8">
        <Link href="/">
          <ProspectIQLogo />
        </Link>
      </div>
      {children}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} ProspectIQ. All rights reserved.
      </p>
    </div>
  );
}
