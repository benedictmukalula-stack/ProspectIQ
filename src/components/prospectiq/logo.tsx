import { Brain } from "lucide-react";

export function ProspectIQLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
        <Brain className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="text-xl font-bold tracking-tight text-foreground">
        Prospect<span className="text-primary">IQ</span>
      </span>
    </div>
  );
}
