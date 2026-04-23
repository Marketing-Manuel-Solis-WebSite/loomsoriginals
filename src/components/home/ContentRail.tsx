"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ContentRail({
  title,
  eyebrow,
  seeAllHref,
  seeAllLabel = "Ver todo",
  children,
  className,
}: {
  title: string;
  eyebrow?: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scrollBy = (delta: number) => {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className={cn("relative", className)}>
      <div className="mx-auto flex max-w-[1440px] items-end justify-between px-4 sm:px-6 lg:px-10">
        <div>
          {eyebrow ? (
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-500">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="font-display text-2xl italic text-ivory-50 sm:text-3xl">{title}</h2>
        </div>
        {seeAllHref ? (
          <Link
            href={seeAllHref}
            className="hidden text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-500 hover:text-gold-400 transition-colors sm:inline-flex items-center gap-1"
          >
            {seeAllLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>

      <div className="group/rail relative mt-5">
        <button
          type="button"
          onClick={() => scrollBy(-600)}
          aria-label="Desplazar a la izquierda"
          className={cn(
            "absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-navy-950/80 p-2.5 backdrop-blur-md transition-opacity duration-300 ease-apple lg:grid",
            "place-items-center ring-1 ring-gold-500/25 hover:bg-navy-900 hover:ring-gold-500/50",
            canLeft ? "opacity-0 group-hover/rail:opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <ChevronLeft className="h-5 w-5 text-ivory-50" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(600)}
          aria-label="Desplazar a la derecha"
          className={cn(
            "absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-navy-950/80 p-2.5 backdrop-blur-md transition-opacity duration-300 ease-apple lg:grid",
            "place-items-center ring-1 ring-gold-500/25 hover:bg-navy-900 hover:ring-gold-500/50",
            canRight ? "opacity-0 group-hover/rail:opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <ChevronRight className="h-5 w-5 text-ivory-50" />
        </button>

        <div
          ref={scrollerRef}
          className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 pb-4 sm:gap-5 sm:px-6 lg:px-10"
        >
          {children}
        </div>
      </div>
    </section>
  );
}
