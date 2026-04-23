import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { SITE } from "@/lib/site";
import { withUtm } from "@/lib/utils";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";
import { Star, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre Loom Originals",
  description:
    "Loom Originals es un estudio editorial de historias migrantes producido por el Bufete Manuel Solís, firma de inmigración líder en Estados Unidos con más de 30 años de experiencia.",
  alternates: { canonical: "/sobre" },
  openGraph: {
    title: "Sobre Loom Originals — Historias migrantes del Bufete Manuel Solís",
    description:
      "Un estudio editorial dedicado a contar las historias humanas detrás de cada caso migratorio.",
    type: "article",
    url: `${SITE.url}/sobre`,
  },
};

const FAQS = [
  {
    question: "¿Qué es Loom Originals?",
    answer:
      "Loom Originals es un estudio editorial digital que produce series documentales sobre historias migrantes reales en Estados Unidos. Nuestro contenido busca humanizar los procesos de inmigración — reunificación familiar, asilo, visas de trabajo, ciudadanía, defensa contra la deportación — mostrándolos en la voz de las familias que los viven.",
  },
  {
    question: "¿Quién produce Loom Originals?",
    answer:
      "Loom Originals es producido por Bufete Manuel Solís, firma de inmigración con más de 30 años de experiencia representando a miles de familias en Estados Unidos. El contenido editorial es independiente del área legal del bufete — las historias se cuentan con rigor periodístico, no como publicidad.",
  },
  {
    question: "¿El contenido es asesoría legal?",
    answer:
      "No. Loom Originals es contenido informativo y editorial. Cada caso migratorio es único y requiere asesoría de un abogado licenciado. Si su caso es similar al de alguna de las familias que presentamos, le invitamos a agendar una consulta gratuita con el equipo del bufete.",
  },
  {
    question: "¿Cuesta ver Loom Originals?",
    answer:
      "No. Todo el contenido es gratuito y está disponible tanto en Loom Originals como en el canal de YouTube del Bufete Manuel Solís. Al ver los episodios aquí ayuda al canal a crecer y a que más familias descubran historias que pueden ayudarles.",
  },
  {
    question: "¿Cómo puedo compartir mi historia?",
    answer:
      "Si usted tiene una historia migratoria que considera que vale la pena documentar, escríbanos a historias@loomsoriginal.com. Todas las conversaciones son confidenciales. Evaluamos cada caso con cuidado antes de considerar producir un episodio.",
  },
];

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE.url}/` },
          { name: "Sobre", url: `${SITE.url}/sobre` },
        ]}
      />
      <FaqJsonLd items={FAQS} />

      <Container size="md" className="pt-28 pb-20">
        <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-700">
          <span className="h-px w-8 bg-gold-500" />
          Sobre Loom Originals
        </p>
        <h1 className="mt-6 font-display text-[clamp(2.5rem,7vw,5rem)] italic leading-[1.02] text-ink text-balance">
          Un estudio dedicado a contar las historias que el sistema a veces olvida.
        </h1>
        <div className="mt-10 space-y-5 text-[16.5px] leading-relaxed text-gray-700 text-pretty">
          <p>
            Loom Originals es una iniciativa editorial del Bufete Manuel Solís, firma de inmigración
            con más de tres décadas ejerciendo en Texas y a nivel nacional. Creemos que detrás de
            cada caso hay un testimonio humano que merece ser escuchado con cuidado, sin
            sentimentalismo y sin tecnicismos vacíos.
          </p>
          <p>
            Cada serie que producimos parte de una convicción simple: la ley migratoria
            estadounidense es complicada, lenta, y a veces injusta, pero las personas que la navegan
            son mucho más que su expediente. Documentamos sus procesos con rigor y con respeto, y
            procuramos que quien nos mire desde su casa se sienta mejor equipado para entender su
            propio camino.
          </p>
          <p>
            Loom Originals no es un sustituto de la asesoría legal. Nuestro contenido es
            informativo. Si su caso es similar al de alguna de las familias que verá, le invitamos a
            agendar una consulta gratuita con el equipo del bufete.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <ButtonLink
            href={withUtm(SITE.lawFirm.consultationUrl, {
              source: "looms",
              medium: "about",
              campaign: "consulta",
            })}
            variant="primary"
            size="lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            Agende una consulta gratuita
            <ChevronRight className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href="/series" variant="ghost" size="lg">
            Ver el catálogo
          </ButtonLink>
          <ButtonLink
            href={withUtm(SITE.lawFirm.reviewsUrl, {
              source: "looms",
              medium: "about",
              campaign: "reviews",
            })}
            variant="subtle"
            size="lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Star className="h-4 w-4" />
            Leer reseñas
          </ButtonLink>
        </div>
      </Container>

      <section className="border-t border-gray-200 bg-paper py-20">
        <Container size="md">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-700">
            <span className="h-px w-8 bg-gold-500" />
            Preguntas frecuentes
          </p>
          <h2 className="mt-4 font-display text-4xl italic text-ink">
            Lo que la gente pregunta sobre Loom
          </h2>
          <div className="mt-10 space-y-3">
            {FAQS.map((f) => (
              <details
                key={f.question}
                className="group rounded-2xl bg-white ring-1 ring-gray-200 open:shadow-md transition-shadow"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left font-medium text-ink">
                  <span className="text-[16px]">{f.question}</span>
                  <span className="h-6 w-6 shrink-0 rounded-full border border-gray-300 grid place-items-center text-gray-500 group-open:border-gold-400 group-open:text-gold-700 group-open:rotate-45 transition-all">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-6 text-[15px] leading-relaxed text-gray-600">{f.answer}</div>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
