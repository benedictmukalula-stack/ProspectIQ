import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("queue_metrics")
    .select("*")
    .order("created_at", {
      ascending: false,
    })
    .limit(100);

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  const processed =
    data?.reduce(
      (sum, row) => sum + (row.processed_count || 0),
      0
    ) || 0;

  const delivered =
    data?.reduce(
      (sum, row) => sum + (row.delivered_count || 0),
      0
    ) || 0;

  const failed =
    data?.reduce(
      (sum, row) => sum + (row.failed_count || 0),
      0
    ) || 0;

  return NextResponse.json({
    success: true,
    metrics: {
      processed,
      delivered,
      failed,
    },
  });
}
