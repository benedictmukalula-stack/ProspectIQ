import { Brain } from "lucide-react";

export function ProspectIQLogo({
  className = "",
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const iconBg = variant === "light" ? "bg-emerald-500" : "bg-primary";
  const textColor =
    variant === "light"
      ? "text-white"
      : "text-foreground";
  const accentColor = variant === "light" ? "text-emerald-400" : "text-primary";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}
      >
        <Brain className="h-4 w-4 text-white" />
      </div>
      <span className={`text-lg font-semibold tracking-tight ${textColor}`}>
        Prospect<span className={accentColor}>IQ</span>
      </span>
    </div>
  );
}
