import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Términos de Uso",
  description: "Términos de uso de la plataforma Loom Originals.",
  alternates: { canonical: "/terminos" },
};

export default function TermsPage() {
  return (
    <Container size="md" className="pt-28 pb-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-500">Legal</p>
      <h1 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] italic leading-tight text-ivory-50">
        Términos de Uso
      </h1>
      <p className="mt-3 text-sm text-ivory-200/70">Última actualización: 22 de abril de 2026</p>
      <div className="mt-10 space-y-6 text-[15.5px] leading-relaxed text-ivory-200/90 text-pretty">
        <p>
          Al usar loomsoriginal.com usted acepta estos términos. El contenido publicado en este
          sitio es editorial e informativo. No constituye asesoría legal ni crea una relación
          abogado-cliente con el Bufete Manuel Solís.
        </p>
        <h2 className="font-display text-2xl italic text-ivory-50">Contenido de la plataforma</h2>
        <p>
          El video, texto y arte son propiedad del Bufete Manuel Solís o de sus licenciantes. Se
          permite compartir enlaces. No se permite copiar, redistribuir o usar el contenido con
          fines comerciales sin permiso por escrito.
        </p>
        <h2 className="font-display text-2xl italic text-ivory-50">Cuentas de usuario</h2>
        <p>
          Usted es responsable de la seguridad de su cuenta. No comparta su enlace mágico de acceso.
          Si nota actividad sospechosa, escríbanos de inmediato.
        </p>
        <h2 className="font-display text-2xl italic text-ivory-50">Modificaciones</h2>
        <p>
          Podemos modificar estos términos en cualquier momento. Publicaremos la fecha de la última
          actualización al inicio de la página.
        </p>
        <h2 className="font-display text-2xl italic text-ivory-50">Jurisdicción</h2>
        <p>
          Cualquier controversia relacionada con esta plataforma se resolverá bajo las leyes del
          estado de Texas, Estados Unidos.
        </p>
      </div>
    </Container>
  );
}
