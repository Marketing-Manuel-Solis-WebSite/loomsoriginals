import { cn } from "@/lib/utils";

export function Logo({
  className,
  subtitle = false,
}: {
  className?: string;
  subtitle?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)} aria-label="Loom Originals">
      <span className="font-display text-[1.65rem] leading-none tracking-[0.01em] text-ivory-50">
        <span className="italic">L</span>
        <span>oo</span>
        <span className="italic text-gold-500">m</span>
      </span>
      {subtitle ? (
        <span className="hidden sm:inline font-sans text-[10px] uppercase tracking-[0.28em] text-slate-400">
          originals
        </span>
      ) : null}
    </span>
  );
}
