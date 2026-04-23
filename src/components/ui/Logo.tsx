import { cn } from "@/lib/utils";

export function Logo({
  className,
  subtitle = false,
  tone = "dark",
}: {
  className?: string;
  subtitle?: boolean;
  tone?: "dark" | "light";
}) {
  const mainColor = tone === "dark" ? "text-ink" : "text-white";
  const subColor = tone === "dark" ? "text-gray-500" : "text-white/60";
  return (
    <span className={cn("inline-flex items-baseline gap-2.5", className)} aria-label="Loom Originals">
      <span className={cn("font-display text-[1.75rem] leading-none tracking-[-0.01em]", mainColor)}>
        <span className="italic">L</span>
        <span className="font-medium">oo</span>
        <span className="italic text-gold-600">m</span>
      </span>
      {subtitle ? (
        <span className={cn("hidden sm:inline font-sans text-[10px] uppercase tracking-[0.3em] font-semibold", subColor)}>
          originals
        </span>
      ) : null}
    </span>
  );
}
