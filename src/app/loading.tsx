export default function Loading() {
  return (
    <div className="grid min-h-[60dvh] place-items-center" role="status" aria-live="polite">
      <div className="glass flex items-center gap-4 rounded-full px-6 py-3">
        <svg
          aria-hidden
          className="h-5 w-5 animate-spin text-gold-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="9" opacity=".2" />
          <path d="M21 12a9 9 0 0 1-9 9" strokeLinecap="round" />
        </svg>
        <span className="text-sm text-ivory-200">Cargando…</span>
      </div>
    </div>
  );
}
