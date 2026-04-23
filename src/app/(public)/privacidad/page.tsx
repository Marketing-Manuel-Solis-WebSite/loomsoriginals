import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Cómo Loom Originals recopila, usa y protege sus datos. Producción del Bufete Manuel Solís.",
  alternates: { canonical: "/privacidad" },
};

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "Información que recopilamos",
    body: [
      "Correo electrónico y nombre cuando usted crea una cuenta.",
      "Historial de visualización, favoritos y preferencias de idioma mientras usa la plataforma.",
      "Datos técnicos (navegador, sistema operativo, dirección IP truncada) para analítica agregada.",
    ],
  },
  {
    heading: "Cómo usamos sus datos",
    body: [
      "Para ofrecer funciones personalizadas como 'Continuar viendo' y 'Mi lista'.",
      "Para medir qué episodios son más útiles para nuestra audiencia.",
      "Para comunicarle, sólo si usted se suscribió, sobre nuevos episodios.",
    ],
  },
  {
    heading: "Pixeles y analítica de terceros",
    body: [
      "Usamos Google Analytics 4, Meta Pixel y TikTok Pixel para medir rendimiento.",
      "Puede ver más en nuestra Política de Cookies. Todos estos servicios respetan Do Not Track.",
    ],
  },
  {
    heading: "Sus derechos",
    body: [
      "Puede solicitar acceso, rectificación, portabilidad o eliminación de sus datos escribiendo a privacidad@loomsoriginal.com.",
      "Cumplimos con GDPR para residentes en la Unión Europea y con CCPA para residentes en California.",
    ],
  },
  {
    heading: "Relación con el Bufete Manuel Solís",
    body: [
      "Loom Originals es una producción editorial del Bufete Manuel Solís. Sus datos en esta plataforma son distintos y separados de cualquier expediente legal que tenga con el bufete.",
      "No enviaremos sus datos de usuario al equipo legal sin su consentimiento explícito.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <Container size="md" className="pt-28 pb-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-500">Legal</p>
      <h1 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] italic leading-tight text-ivory-50">
        Política de Privacidad
      </h1>
      <p className="mt-3 text-sm text-ivory-200/70">Última actualización: 22 de abril de 2026</p>
      <div className="mt-10 space-y-10">
        {SECTIONS.map((s) => (
          <section key={s.heading}>
            <h2 className="font-display text-2xl italic text-ivory-50">{s.heading}</h2>
            <ul className="mt-4 space-y-2.5 text-[15.5px] leading-relaxed text-ivory-200/90">
              {s.body.map((b, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-2 h-1 w-1.5 shrink-0 rounded-full bg-gold-500" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-12 text-sm text-ivory-200/70">
        Contacto: <a href={`mailto:${SITE.legalEmail}`} className="text-gold-500 hover:text-gold-400">{SITE.legalEmail}</a>
      </p>
    </Container>
  );
}
