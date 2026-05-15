"use client";

import { isDemoMode } from "@/lib/supabase/client";
import { AlertTriangle } from "lucide-react";

export function DemoBanner() {
  if (!isDemoMode) return null;

  return (
    <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3.5 py-2.5">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
      <p className="text-xs leading-relaxed text-amber-200/80">
        <span className="font-semibold text-amber-300">Demo mode:</span>{" "}
        Supabase is not connected. Account creation is disabled.
      </p>
    </div>
  );
}
