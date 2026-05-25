import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("dead_letters")
    .select("*")
    .order("failed_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Missing dead letter id" }, { status: 400 });
  }

  const { data: dead, error: fetchError } = await supabase
    .from("dead_letters")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !dead) {
    return NextResponse.json({ error: "Dead letter not found" }, { status: 404 });
  }

  const { error: insertError } = await supabase.from("queue").insert({
    recipient: dead.recipient,
    subject: dead.subject,
    body: dead.body,
    status: "pending",
    retry_count: 0,
    last_error: null,
    next_retry_at: null,
    metadata: dead.metadata,
    created_at: new Date().toISOString(),
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await supabase.from("dead_letters").delete().eq("id", id);
  return NextResponse.json({ success: true, message: "Job requeued" });
}

export async function DELETE() {
  const { error } = await supabase.from("dead_letters").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, message: "All dead letters cleared" });
}
