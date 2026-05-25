import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("score", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Leads API error:", error);
    return NextResponse.json({ leads: [], total: 0, error: error.message });
  }
  // Ensure we return the wrapped object, not the raw array
  return NextResponse.json({ leads: data || [], total: data?.length || 0 });
}
