import { NextResponse } from "next/server";
import { handleAuthCallback } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { success, error } = await handleAuthCallback(request);

  if (!success || error) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error ?? "Callback failed")}`, request.url)
    );
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
