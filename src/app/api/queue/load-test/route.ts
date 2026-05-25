import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { count = 5 } = await req.json();
  
  const jobs = Array.from({ length: count }, (_, i) => ({
    recipient: `test+${i}@example.com`,
    subject: `Test email ${i}`,
    body: `This is test email ${i}`,
    status: "pending",
    created_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase.from("queue").insert(jobs).select();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, inserted: data?.length || 0 });
}
