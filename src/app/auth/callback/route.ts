import { NextRequest, NextResponse } from "next/server";
import { createBrowserSupabaseClient } from "../lib/supabase/client";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/login?error=Missing confirmation code", request.url)
    );
  }

  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return NextResponse.redirect(
      new URL("/auth/login?error=Supabase not connected", request.url)
    );
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
