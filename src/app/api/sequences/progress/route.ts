import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  // 1. Get enrollments
  const { data: enrollments, error: enrollError } = await supabase
    .from("lead_sequences")
    .select("*")
    .order("created_at", { ascending: false });

  if (enrollError) {
    return NextResponse.json({ error: enrollError.message }, { status: 500 });
  }

  if (!enrollments || enrollments.length === 0) {
    return NextResponse.json([]);
  }

  // 2. Extract unique lead IDs and sequence IDs
  const leadIds = [...new Set(enrollments.map(e => e.lead_id))];
  const seqIds = [...new Set(enrollments.map(e => e.sequence_id))];

  // 3. Fetch leads
  const { data: leads } = await supabase
    .from("leads")
    .select("id, email, company")
    .in("id", leadIds);

  // 4. Fetch sequences
  const { data: sequences } = await supabase
    .from("sequences")
    .select("id, name")
    .in("id", seqIds);

  // 5. Fetch steps for each sequence
  const { data: steps } = await supabase
    .from("sequence_steps")
    .select("*")
    .in("sequence_id", seqIds)
    .order("step_order", { ascending: true });

  // Build lookup maps
  const leadMap = Object.fromEntries((leads || []).map(l => [l.id, l]));
  const seqMap = Object.fromEntries((sequences || []).map(s => [s.id, s]));
  const stepsBySeq = (steps || []).reduce((acc, step) => {
    if (!acc[step.sequence_id]) acc[step.sequence_id] = [];
    acc[step.sequence_id].push(step);
    return acc;
  }, {} as Record<string, any[]>);

  // Enrich each enrollment
  const enriched = enrollments.map(enr => {
    const seqSteps = stepsBySeq[enr.sequence_id] || [];
    const totalSteps = seqSteps.length;
    const currentStepIdx = enr.current_step || 0;
    const progress = totalSteps === 0 ? 0 : (currentStepIdx / totalSteps) * 100;
    const nextStep = seqSteps[currentStepIdx] || null;
    return {
      ...enr,
      totalSteps,
      progress,
      nextStep,
      lead: leadMap[enr.lead_id] || null,
      sequence: seqMap[enr.sequence_id] || null,
    };
  });

  return NextResponse.json(enriched);
}
