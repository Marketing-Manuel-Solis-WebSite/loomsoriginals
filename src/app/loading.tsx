export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Cargando"
      className="fixed inset-0 z-[60] grid place-items-center bg-paper/85 backdrop-blur-xl"
    >
      {/* Top progress bar */}
      <div className="absolute inset-x-0 top-0 h-[2px] overflow-hidden bg-transparent">
        <div className="h-full w-1/3 -translate-x-full bg-gradient-to-r from-transparent via-gold-500 to-transparent [animation:progressBar_1.6s_var(--ease-apple)_infinite]" />
      </div>

      <div className="flex flex-col items-center gap-5">
        {/* Minimal monogram */}
        <span className="font-display text-[2.25rem] leading-none tracking-[-0.01em] text-white">
          <span className="italic">L</span>
          <span className="font-medium">oo</span>
          <span className="italic text-gold-600">m</span>
          <span className="italic text-gold-600">s</span>
        </span>

        {/* Thin under-rule with shimmer */}
        <span
          aria-hidden
          className="h-[1.5px] w-24 overflow-hidden rounded-full bg-gray-200"
        >
          <span className="block h-full w-full bg-gradient-to-r from-transparent via-gold-500 to-transparent animate-shimmer" />
        </span>

        <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gray-400">
          Cargando
        </span>
      </div>
    </div>
  );
}
