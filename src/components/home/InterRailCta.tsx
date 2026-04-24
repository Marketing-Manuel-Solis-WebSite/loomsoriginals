"use client";

import { ArrowUpRight } from "lucide-react";
import { trackCtaClick } from "@/lib/tracking";

export function InterRailCta({
  headline,
  body,
  href,
  ctaLabel,
  variant = "default",
}: {
  headline: string;
  body: string;
  href: string;
  ctaLabel: string;
  variant?: "default" | "compact";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackCtaClick("consultation", href, null, { source: "inter-rail" })}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-gold-300/60 bg-gradient-to-br from-gold-50 via-white to-parchment px-7 py-6 transition-all hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between sm:gap-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-gold-200/60 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="relative max-w-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-700">
          Bufete Manuel Solís
        </p>
        <p className="mt-1.5 font-display text-xl italic text-ink text-balance sm:text-2xl">
          {headline}
        </p>
        {variant === "default" ? (
          <p className="mt-1 text-[14px] leading-relaxed text-gray-600">{body}</p>
        ) : null}
      </div>
      <span className="relative inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-white shadow-md transition-transform group-hover:scale-105">
        {ctaLabel}
        <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </a>
  );
}
