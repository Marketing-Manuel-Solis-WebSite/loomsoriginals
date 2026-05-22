import { cn } from "@/lib/utils";

// Padding horizontal del shell (igual que ContentRail / HomePage).
const PAD = "px-8 sm:px-14 md:px-24 lg:px-40 xl:px-56 2xl:px-72";

function Shimmer({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-xl bg-surface", className)} />;
}

/** Rail de carga: encabezado + tarjetas 16:9 (deep-ink, pulse). */
export function RailSkeleton({ cards = 6, withHeader = true }: { cards?: number; withHeader?: boolean }) {
  return (
    <section className="mb-12">
      {withHeader ? (
        <div className={cn("mx-auto max-w-[1440px]", PAD)}>
          <Shimmer className="h-8 w-56" />
        </div>
      ) : null}
      <div className={cn("mt-6 flex gap-4 overflow-hidden sm:gap-5", PAD)}>
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="w-[240px] shrink-0 sm:w-[288px] lg:w-[320px]">
            <Shimmer className="aspect-video w-full" />
            <Shimmer className="mt-2.5 h-4 w-3/4 rounded-md" />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Hero de carga: billboard alto con líneas de título y CTAs. */
export function HeroSkeleton() {
  return (
    <div aria-hidden className="relative min-h-[70dvh] w-full overflow-hidden bg-surface animate-pulse">
      <div className="absolute inset-0 depth-wash opacity-40" />
      <div className={cn("absolute inset-x-0 bottom-24 mx-auto w-full max-w-[1440px]", PAD)}>
        <Shimmer className="h-5 w-40" />
        <Shimmer className="mt-5 h-16 w-2/3" />
        <Shimmer className="mt-5 h-4 w-1/2" />
        <div className="mt-8 flex gap-3">
          <Shimmer className="h-12 w-44 rounded-full" />
          <Shimmer className="h-12 w-44 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Detalle/player de carga: marco 16:9 + título. */
export function PlayerSkeleton() {
  return (
    <div className={cn("mx-auto max-w-[1100px] pt-28 pb-16", PAD)}>
      <Shimmer className="aspect-video w-full rounded-3xl" />
      <Shimmer className="mt-6 h-8 w-2/3" />
      <Shimmer className="mt-3 h-4 w-1/2" />
    </div>
  );
}

/** Grilla de carga: para búsqueda y categorías. */
export function GridSkeleton({ items = 12 }: { items?: number }) {
  return (
    <div className={cn("mx-auto max-w-[1440px] pt-28 pb-16", PAD)}>
      <Shimmer className="h-9 w-64" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i}>
            <Shimmer className="aspect-video w-full" />
            <Shimmer className="mt-2.5 h-4 w-3/4 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
