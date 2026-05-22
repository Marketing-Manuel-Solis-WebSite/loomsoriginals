"use client";

import Link from "next/link";
import { Children, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ContentRail({
  title,
  eyebrow,
  seeAllHref,
  seeAllLabel = "Ver todo",
  railNumber,
  minItems = 1,
  children,
  className,
}: {
  title: string;
  eyebrow?: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  railNumber?: string;
  /** Si el rail tiene menos de `minItems` hijos, no se renderiza (evita rails "rotos"). */
  minItems?: number;
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

  // Guarda de rails thin: con pocos items se ve roto → mejor esconderlo.
  if (Children.count(children) < minItems) return null;

  return (
    <section className={cn("relative", className)}>
      <div className="mx-auto flex max-w-[1440px] items-end justify-between gap-6 px-8 sm:px-14 md:px-24 lg:px-40 xl:px-56 2xl:px-72">
        <div className="flex items-end gap-5">
          {railNumber ? (
            <span className="hidden sm:inline-block font-display text-6xl italic leading-none text-gray-200 select-none transition-colors duration-500 group-hover/rail-header:text-gold-300">
              {railNumber}
            </span>
          ) : null}
          <div className="group/rail-title">
            {eyebrow ? (
              <p className="mb-2.5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-700">
                <span className="h-px w-8 bg-gold-500 transition-all duration-500 group-hover/rail-title:w-14" />
                {eyebrow}
              </p>
            ) : null}
            <h2 className="font-display text-[28px] italic leading-tight text-white sm:text-[34px] transition-colors duration-500 group-hover/rail-title:text-gold-700">
              {title}
            </h2>
          </div>
        </div>
        {seeAllHref ? (
          <Link
            href={seeAllHref}
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white hover:text-gold-700 transition-colors whitespace-nowrap"
          >
            {seeAllLabel}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>

      <div className="group/rail relative mt-6">
        <button
          type="button"
          onClick={() => scrollBy(-600)}
          aria-label="Desplazar a la izquierda"
          className={cn(
            "absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-ink/80 backdrop-blur-md p-3 shadow-lg transition-all duration-400 ease-apple lg:grid",
            "place-items-center ring-1 ring-white/10 hover:ring-gold-400 hover:shadow-xl hover:scale-110 active:scale-95",
            canLeft
              ? "opacity-0 -translate-x-2 group-hover/rail:opacity-100 group-hover/rail:translate-x-0"
              : "opacity-0 pointer-events-none"
          )}
        >
          <ChevronLeft className="h-5 w-5 text-white transition-transform duration-300 group-hover/rail:-translate-x-0.5" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(600)}
          aria-label="Desplazar a la derecha"
          className={cn(
            "absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-ink/80 backdrop-blur-md p-3 shadow-lg transition-all duration-400 ease-apple lg:grid",
            "place-items-center ring-1 ring-white/10 hover:ring-gold-400 hover:shadow-xl hover:scale-110 active:scale-95",
            canRight
              ? "opacity-0 translate-x-2 group-hover/rail:opacity-100 group-hover/rail:translate-x-0"
              : "opacity-0 pointer-events-none"
          )}
        >
          <ChevronRight className="h-5 w-5 text-white transition-transform duration-300 group-hover/rail:translate-x-0.5" />
        </button>

        <div
          ref={scrollerRef}
          className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-8 pb-6 sm:gap-5 sm:px-14 md:px-24 lg:px-40 xl:px-56 2xl:px-72"
        >
          {children}
        </div>
      </div>
    </section>
  );
}
