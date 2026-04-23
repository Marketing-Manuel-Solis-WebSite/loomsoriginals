import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { SITE } from "@/lib/site";
import { withUtm } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sobre Loom Originals",
  description:
    "Loom Originals es un estudio editorial de historias migrantes producido por el Bufete Manuel Solís, firma de inmigración líder en Estados Unidos.",
  alternates: { canonical: "/sobre" },
};

export default function AboutPage() {
  return (
    <Container size="md" className="pt-28 pb-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-500">
        Sobre Loom Originals
      </p>
      <h1 className="mt-4 font-display text-[clamp(2.5rem,7vw,5rem)] italic leading-none text-ivory-50 text-balance">
        Un estudio dedicado a contar las historias que el sistema a veces olvida.
      </h1>
      <div className="mt-10 space-y-5 text-[16.5px] leading-relaxed text-ivory-200/90 text-pretty">
        <p>
          Loom Originals es una iniciativa editorial del Bufete Manuel Solís, firma de inmigración
          con más de tres décadas ejerciendo en Texas y a nivel nacional. Creemos que detrás de
          cada caso hay un testimonio humano que merece ser escuchado con cuidado, sin sentimentalismo
          y sin tecnicismos vacíos.
        </p>
        <p>
          Cada serie que producimos parte de una convicción simple: la ley migratoria estadounidense
          es complicada, lenta, y a veces injusta, pero las personas que la navegan son mucho más
          que su expediente. Documentamos sus procesos con rigor y con respeto, y procuramos que
          quien nos mire desde su casa se sienta mejor equipado para entender su propio camino.
        </p>
        <p>
          Loom Originals no es un sustituto de la asesoría legal. Nuestro contenido es informativo.
          Si su caso es similar al de alguna de las familias que verá, le invitamos a agendar una
          consulta gratuita con el equipo del bufete.
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
        </ButtonLink>
        <ButtonLink href="/series" variant="secondary" size="lg">
          Ver el catálogo
        </ButtonLink>
      </div>
    </Container>
  );
}
