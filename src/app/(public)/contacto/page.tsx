import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contacte a Loom Originals. Historias, alianzas, prensa, soporte.",
  alternates: { canonical: "/contacto" },
};

export default function ContactoPage() {
  return (
    <Container size="md" className="pt-28 pb-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-500">Contacto</p>
      <h1 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] italic leading-tight text-ivory-50">
        Escríbanos
      </h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <ContactCard
          title="¿Tiene una historia?"
          body="Buscamos familias dispuestas a compartir su caso. Todas las conversaciones son confidenciales."
          email="historias@loomsoriginal.com"
        />
        <ContactCard
          title="Prensa y alianzas"
          body="Para solicitudes de prensa, colaboraciones editoriales o entrevistas."
          email="prensa@loomsoriginal.com"
        />
        <ContactCard
          title="Soporte técnico"
          body="¿Problemas con su cuenta, reproducción o suscripción?"
          email={SITE.contactEmail}
        />
        <ContactCard
          title="Consultas legales"
          body="Para agendar una consulta con el Bufete Manuel Solís."
          email="info@manuelsolis.com"
        />
      </div>
    </Container>
  );
}

function ContactCard({ title, body, email }: { title: string; body: string; email: string }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="font-display text-xl italic text-ivory-50">{title}</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-ivory-200/85">{body}</p>
      <a
        href={`mailto:${email}`}
        className="mt-4 inline-block text-[13px] font-medium text-gold-500 hover:text-gold-400"
      >
        {email}
      </a>
    </div>
  );
}
