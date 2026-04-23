"use client";

import { ChevronRight, Phone } from "lucide-react";
import { withUtm } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { trackCtaClick } from "@/lib/tracking";

type Props = {
  episodeId: string;
  episodeSlug: string;
  categoryLabel?: string | null;
};

const DEFAULT_HEADLINE = "¿Su caso se parece a esta historia?";
const DEFAULT_SUB = "Hable hoy con un abogado licenciado del equipo del Bufete Manuel Solís. La consulta inicial es gratuita.";

const HEADLINES_BY_CATEGORY: Record<string, { headline: string; sub: string }> = {
  "reunificacion-familiar": {
    headline: "¿Está pidiendo a un familiar?",
    sub: "Revisamos su caso de petición familiar y le decimos en qué fila está, cuánto puede tardar, y qué podemos acelerar.",
  },
  asilo: {
    headline: "¿Necesita protección legal?",
    sub: "Nuestro equipo ha ganado casos de asilo complejos durante tres décadas. La primera consulta es gratuita y confidencial.",
  },
  "visas-de-trabajo": {
    headline: "¿Busca patrocinio laboral?",
    sub: "H-1B, L-1, O-1, EB-1, EB-2 NIW. Le ayudamos a identificar la categoría correcta para su perfil.",
  },
  ciudadania: {
    headline: "¿Listo para hacerse ciudadano?",
    sub: "Le preparamos para el examen, la entrevista y la ceremonia. Miles de clientes han jurado su lealtad con nuestro apoyo.",
  },
  deportacion: {
    headline: "¿Recibió un Notice to Appear?",
    sub: "Cada día cuenta. Actuemos rápido para identificar su mejor alivio disponible.",
  },
};

export function EpisodeCta({ episodeId, episodeSlug, categoryLabel }: Props) {
  const data = categoryLabel ? HEADLINES_BY_CATEGORY[categoryLabel] : undefined;
  const headline = data?.headline ?? DEFAULT_HEADLINE;
  const sub = data?.sub ?? DEFAULT_SUB;
  const consultHref = withUtm(SITE.lawFirm.consultationUrl, {
    source: "looms",
    medium: "episode-cta",
    campaign: "consulta",
    content: episodeSlug,
  });
  return (
    <aside
      aria-label="Consulta con el bufete"
      className="glass-strong relative overflow-hidden rounded-3xl px-6 py-8 sm:px-10 sm:py-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl"
      />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-500">
            Bufete Manuel Solís — consulta gratuita
          </p>
          <h3 className="mt-3 font-display text-2xl italic text-ivory-50 sm:text-3xl text-balance">
            {headline}
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-ivory-200/85 text-pretty">{sub}</p>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <a
            href={consultHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCtaClick("consultation", consultHref, episodeId)}
            className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3.5 text-sm font-semibold text-navy-950 shadow-[0_12px_32px_-8px_rgba(212,175,55,0.5)] transition-transform hover:-translate-y-0.5 hover:bg-gold-400"
          >
            Agendar consulta
            <ChevronRight className="h-4 w-4" />
          </a>
          <a
            href={`tel:${SITE.lawFirm.phone}`}
            onClick={() => trackCtaClick("phone", `tel:${SITE.lawFirm.phone}`, episodeId)}
            className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 px-6 py-3 text-[13px] font-medium text-ivory-100 hover:border-gold-400 hover:text-gold-400"
          >
            <Phone className="h-4 w-4" />
            {SITE.lawFirm.phone}
          </a>
        </div>
      </div>
    </aside>
  );
}
