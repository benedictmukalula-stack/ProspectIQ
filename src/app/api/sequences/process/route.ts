import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST() {
  const now = new Date().toISOString();

  // Fetch active enrollments ready for next email
  const { data: enrollments, error: fetchError } = await supabase
    .from("lead_sequences")
    .select("*")
    .eq("status", "active")
    .or(`next_email_at.is.null,next_email_at.lte.${now}`);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!enrollments || enrollments.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  let processed = 0;
  for (const enrollment of enrollments) {
    // Fetch steps for this sequence
    const { data: steps, error: stepsError } = await supabase
      .from("sequence_steps")
      .select("*")
      .eq("sequence_id", enrollment.sequence_id)
      .order("step_order", { ascending: true });

    if (stepsError || !steps || steps.length === 0) {
      console.error(`No steps for sequence ${enrollment.sequence_id}`);
      continue;
    }

    const currentStepIndex = enrollment.current_step || 0;
    if (currentStepIndex >= steps.length) {
      // Sequence completed
      await supabase
        .from("lead_sequences")
        .update({ status: "completed", completed_at: now })
        .eq("id", enrollment.id);
      continue;
    }

    const step = steps[currentStepIndex];
    if (!step) continue;

    // Get lead email
    const { data: lead } = await supabase
      .from("leads")
      .select("email")
      .eq("id", enrollment.lead_id)
      .single();
    if (!lead) continue;

    // Queue email
    const { error: queueError } = await supabase.from("queue").insert({
      recipient: lead.email,
      subject: step.subject,
      body: step.body,
      status: "pending",
      scheduled_for: now,
      created_at: now,
    });
    if (queueError) {
      console.error("Queue error:", queueError);
      continue;
    }

    // Calculate next email date
    const nextEmail = new Date();
    nextEmail.setDate(nextEmail.getDate() + (step.delay_days || 0));

    // Update enrollment
    await supabase
      .from("lead_sequences")
      .update({
        current_step: currentStepIndex + 1,
        next_email_at: nextEmail.toISOString(),
        updated_at: now,
      })
      .eq("id", enrollment.id);

    processed++;
  }

  return NextResponse.json({ processed });
}
