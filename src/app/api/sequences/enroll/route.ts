import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { sequenceId, leadIds } = await req.json();
  if (!sequenceId || !leadIds || !leadIds.length) {
    return NextResponse.json({ error: "Missing sequenceId or leadIds" }, { status: 400 });
  }

  // Prepare enrollments
  const enrollments = leadIds.map((leadId: string) => ({
    lead_id: leadId,
    sequence_id: sequenceId,
    status: "active",
    current_step: 0,
    started_at: new Date().toISOString(),
    next_email_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase.from("lead_sequences").insert(enrollments).select();
  if (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, enrolled: data.length });
}
