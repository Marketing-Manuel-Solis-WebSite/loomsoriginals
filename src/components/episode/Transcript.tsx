"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Transcript({
  transcript,
  language = "es",
}: {
  transcript: string | null;
  language?: "es" | "en";
}) {
  const [open, setOpen] = useState(false);
  if (!transcript) return null;
  const paragraphs = transcript.split(/\n+/).filter((p) => p.trim().length > 0);

  return (
    <section
      className="mt-10 rounded-3xl border border-gray-200 bg-paper overflow-hidden"
      aria-label={language === "en" ? "Transcript" : "Transcripción"}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-white"
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-gold-700">
            {language === "en" ? "Full transcript" : "Transcripción completa"}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {language === "en"
              ? "Read the episode in full text — also indexed by search engines."
              : "Lea el episodio en texto completo — también indexado por buscadores."}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-gold-700 transition-transform duration-400 ease-apple",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-500 ease-apple",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-gray-200 bg-white px-6 py-6 space-y-4 text-[15.5px] leading-[1.75] text-gray-800 max-h-[70vh] overflow-y-auto">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-pretty">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
