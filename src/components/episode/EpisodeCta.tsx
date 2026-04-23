"use client";

import { ChevronRight, Phone, Star } from "lucide-react";
import { withUtm } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { trackCtaClick } from "@/lib/tracking";

type Props = {
  episodeId: string;
  episodeSlug: string;
  categoryLabel?: string | null;
};

const DEFAULT_HEADLINE = "¿Su caso se parece a esta historia?";
const DEFAULT_SUB =
  "Hable hoy con un abogado licenciado del equipo del Bufete Manuel Solís. La consulta inicial es gratuita.";

const HEADLINES_BY_CATEGORY: Record<string, { headline: string; sub: string }> = {
  "reunificacion-familiar": {
    headline: "¿Está pidiendo a un familiar?",
    sub:
      "Revisamos su caso de petición familiar y le decimos en qué fila está, cuánto puede tardar, y qué podemos acelerar.",
  },
  asilo: {
    headline: "¿Necesita protección legal?",
    sub:
      "Nuestro equipo ha ganado casos de asilo complejos durante tres décadas. La primera consulta es gratuita y confidencial.",
  },
  "visas-de-trabajo": {
    headline: "¿Busca patrocinio laboral?",
    sub: "H-1B, L-1, O-1, EB-1, EB-2 NIW. Le ayudamos a identificar la categoría correcta para su perfil.",
  },
  ciudadania: {
    headline: "¿Listo para hacerse ciudadano?",
    sub:
      "Le preparamos para el examen, la entrevista y la ceremonia. Miles de clientes han jurado su lealtad con nuestro apoyo.",
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
  const reviewsHref = withUtm(SITE.lawFirm.reviewsUrl, {
    source: "looms",
    medium: "episode-cta",
    campaign: "reviews",
    content: episodeSlug,
  });
  return (
    <aside
      aria-label="Consulta con el bufete"
      className="glass-strong relative overflow-hidden rounded-3xl px-6 py-10 sm:px-10 sm:py-12"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold-200/70 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gold-100/60 blur-3xl"
      />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-gold-700">
            <span className="h-px w-8 bg-gold-500" />
            Bufete Manuel Solís — consulta gratuita
          </p>
          <h3 className="mt-4 font-display text-3xl italic text-ink sm:text-4xl text-balance">
            {headline}
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-gray-700 text-pretty">{sub}</p>
          <a
            href={reviewsHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackCtaClick("reviews", reviewsHref, episodeId, {
                episodeSlug,
                source: "episode-cta",
              })
            }
            className="mt-5 inline-flex items-center gap-2 text-[12px] font-medium text-gold-700 hover:text-gold-800"
          >
            <Star className="h-3.5 w-3.5 fill-current" />
            Lea testimonios de clientes reales →
          </a>
        </div>
        <div className="flex flex-col gap-2.5 shrink-0">
          <a
            href={consultHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackCtaClick("consultation", consultHref, episodeId, {
                episodeSlug,
                source: "episode-cta",
              })
            }
            className="btn-sheen inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 text-sm font-semibold text-white shadow-[0_14px_32px_-8px_rgba(9,9,11,0.35)] transition-all hover:-translate-y-0.5 hover:bg-gray-800"
          >
            Agendar consulta
            <ChevronRight className="h-4 w-4" />
          </a>
          <a
            href={`tel:${SITE.lawFirm.phone}`}
            onClick={() =>
              trackCtaClick("phone", `tel:${SITE.lawFirm.phone}`, episodeId, { episodeSlug })
            }
            className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-7 py-3.5 text-[13px] font-medium text-ink hover:border-gold-400 hover:text-gold-700"
          >
            <Phone className="h-4 w-4" />
            {SITE.lawFirm.phoneDisplay}
          </a>
        </div>
      </div>
    </aside>
  );
}
