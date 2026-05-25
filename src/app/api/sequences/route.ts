import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("sequences")
    .select("*, steps:sequence_steps(*)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  const { name, steps } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const { data: seq, error: seqError } = await supabase
    .from("sequences")
    .insert({ name })
    .select()
    .single();
  if (seqError) return NextResponse.json({ error: seqError.message }, { status: 500 });

  if (steps?.length) {
    const stepsWithSeqId = steps.map((s: any) => ({ ...s, sequence_id: seq.id }));
    const { error: stepsError } = await supabase.from("sequence_steps").insert(stepsWithSeqId);
    if (stepsError) return NextResponse.json({ error: stepsError.message }, { status: 500 });
  }
  return NextResponse.json(seq);
}
