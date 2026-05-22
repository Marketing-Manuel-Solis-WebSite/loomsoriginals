import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { SITE } from "@/lib/site";
import { withUtm } from "@/lib/utils";
import { BreadcrumbJsonLd, FaqJsonLd, WebPageJsonLd } from "@/components/seo/JsonLd";
import {
  Star,
  ChevronRight,
  ShieldCheck,
  FileText,
  Mic,
  Users,
  PenLine,
  Camera,
  ScrollText,
  Send,
  Globe,
  MapPin,
  Quote,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre Looms Originals",
  description:
    "Looms Originals es un estudio editorial de historias migrantes producido por Law Offices of Manuel Solís, firma de inmigración líder en Estados Unidos con más de 30 años de experiencia.",
  alternates: { canonical: "/sobre" },
  openGraph: {
    title: "Sobre Looms Originals — Historias migrantes de Law Offices of Manuel Solís",
    description:
      "Un estudio editorial dedicado a contar las historias humanas detrás de cada caso migratorio.",
    type: "article",
    url: `${SITE.url}/sobre`,
  },
};

const FAQS = [
  {
    question: "¿Qué es Looms Originals?",
    answer:
      "Looms Originals es un estudio editorial digital que produce series documentales sobre historias migrantes reales en Estados Unidos. Nuestro contenido busca humanizar los procesos de inmigración — reunificación familiar, asilo, visas de trabajo, ciudadanía, defensa contra la deportación — mostrándolos en la voz de las familias que los viven.",
  },
  {
    question: "¿Quién produce Looms Originals?",
    answer:
      "Looms Originals es producido por Law Offices of Manuel Solís, firma de inmigración con más de 30 años de experiencia representando a miles de familias en Estados Unidos. El contenido editorial es independiente del área legal de la firma — las historias se cuentan con rigor periodístico, no como publicidad.",
  },
  {
    question: "¿El contenido es asesoría legal?",
    answer:
      "No. Looms Originals es contenido informativo y editorial. Cada caso migratorio es único y requiere asesoría de un abogado licenciado. Si su caso es similar al de alguna de las familias que presentamos, le invitamos a agendar una consulta con el equipo de la firma.",
  },
  {
    question: "¿Cuesta ver Looms Originals?",
    answer:
      "No. Todo el contenido es gratuito y está disponible tanto en Looms Originals como en el canal de YouTube de Law Offices of Manuel Solís. Al ver los episodios aquí ayuda al canal a crecer y a que más familias descubran historias que pueden ayudarles.",
  },
  {
    question: "¿Cómo puedo compartir mi historia?",
    answer:
      "Si usted tiene una historia migratoria que considera que vale la pena documentar, escríbanos a historias@loomsoriginal.com. Todas las conversaciones son confidenciales. Evaluamos cada caso con cuidado antes de considerar producir un episodio.",
  },
];

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "Consentimiento informado",
    body: "Cada familia firma una autorización editorial antes de filmar. Tienen derecho a revisar el corte final.",
  },
  {
    icon: FileText,
    title: "Casos verificados",
    body: "Solo documentamos casos donde existió relación abogado–cliente con expediente legal completo.",
  },
  {
    icon: Mic,
    title: "Voz propia",
    body: "Las familias hablan en sus palabras. Sin guiones, sin reenactments, sin actores.",
  },
  {
    icon: Users,
    title: "Sin publicidad disfrazada",
    body: "Looms es editorial. La firma no edita ni aprueba contenido más allá de cuestiones legales.",
  },
];

const STATS = [
  { value: "30+", label: "Años de práctica legal" },
  { value: "10K+", label: "Familias representadas" },
  { value: "ES·EN", label: "Atención bilingüe" },
];

const PROCESS = [
  {
    icon: ScrollText,
    label: "Intake",
    title: "Recepción",
    body: "Recibimos historias por correo, WhatsApp o referidos del bufete. Una nota, un audio, un par de líneas — basta.",
  },
  {
    icon: ShieldCheck,
    label: "Vetting",
    title: "Verificación",
    body: "Confirmamos que existió expediente legal y obtenemos consentimiento por escrito de cada miembro de la familia.",
  },
  {
    icon: PenLine,
    label: "Pre-producción",
    title: "Pre-producción",
    body: "Investigación documental: cronología de petición, fechas USCIS, cartas, fotos del antes/durante/después.",
  },
  {
    icon: Camera,
    label: "Filming",
    title: "Rodaje",
    body: "Una a dos sesiones, casa-locación. Cámara estática, micrófono lavalier, sin equipo intrusivo.",
  },
  {
    icon: Send,
    label: "Cut & sign-off",
    title: "Corte final",
    body: "La familia revisa el corte antes de la publicación. Pueden pedir cambios o retirar consentimiento sin costo.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Manuel y su equipo me ayudaron a traer a mi hijo después de 18 años de espera. Nos tomaron de la mano en cada paso.",
    by: "Lourdes G.",
    role: "Petición I-130 · Houston, TX",
  },
  {
    quote:
      "Nunca me sentí tratada como expediente. Cuando filmaron el episodio sentí por primera vez que mi historia importaba.",
    by: "María N.",
    role: "Asilo VAWA · Dallas, TX",
  },
  {
    quote:
      "El equipo legal nos guió por cinco años. La serie nos permitió contarle a mi mamá lo que viví — sin tener que buscar las palabras.",
    by: "Jorge R.",
    role: "Cancelación de remoción · Austin, TX",
  },
];

const COVERAGE = [
  { region: "Texas", note: "Oficina principal · Houston" },
  { region: "California", note: "Casos complejos de asilo" },
  { region: "Nueva York", note: "Visas de trabajo H-1B / O-1" },
  { region: "Florida", note: "Reunificación familiar I-130" },
  { region: "Arizona", note: "Defensa contra remoción" },
  { region: "Illinois", note: "Naturalización N-400" },
];

export default function AboutPage() {
  return (
    <>
      <WebPageJsonLd
        url={`${SITE.url}/sobre`}
        name="Sobre Looms Originals"
        description="Conozca el estudio editorial detrás de Looms Originals — el proceso de producción, los principios y la firma legal que lo respalda."
        type="AboutPage"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE.url}/` },
          { name: "Sobre", url: `${SITE.url}/sobre` },
        ]}
      />
      <FaqJsonLd items={FAQS} />

      {/* ─── Editorial hero ─── */}
      <section className="relative overflow-hidden bg-paper pt-32 pb-24 md:pt-40 md:pb-28">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-gold-100/70 blur-[140px]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 top-2 select-none z-0 edition-number text-[clamp(10rem,24vw,22rem)] leading-[0.78] tracking-[-0.04em]"
        >
          AB
        </span>
        <Container size="xl" className="relative">
          <div className="border-b border-gold-300/40 pb-5">
            <p className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.36em] text-gold-700">
              <span className="h-px w-10 bg-gold-500" />
              Sobre Looms Originals
            </p>
          </div>
          <h1 className="mt-10 max-w-4xl font-display text-[clamp(2.75rem,8vw,6.5rem)] italic leading-[0.95] tracking-[-0.02em] text-white text-balance animate-hero-rise">
            Un estudio dedicado a contar las historias que el sistema
            <span className="text-gold-gradient"> a veces olvida.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-[16.5px] leading-[1.7] text-gray-600 text-pretty">
            Looms Originals es una iniciativa editorial de Law Offices of Manuel Solís, firma de
            inmigración con más de tres décadas ejerciendo en Texas y a nivel nacional. Cada serie
            parte de una convicción simple: las personas que navegan la ley son mucho más que su
            expediente.
          </p>

          {/* Hero meta strip */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <MetaCard label="Fundado" value="2026" hint="Otoño · Houston, TX" />
            <MetaCard label="Idiomas" value="ES · EN" hint="Subtítulos en cada episodio" />
            <MetaCard label="Distribución" value="YouTube + Web" hint="Acceso libre" />
          </div>
        </Container>
      </section>

      {/* ─── Stats strip ─── */}
      <section className="bg-white border-y border-gray-200">
        <Container size="xl" className="py-12">
          <div className="grid gap-8 sm:grid-cols-3 sm:gap-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`text-center sm:px-6 ${
                  i > 0 ? "sm:border-l sm:border-gray-200" : ""
                }`}
              >
                <p className="font-display text-[clamp(2.5rem,5vw,4rem)] italic leading-none text-white">
                  {s.value}
                </p>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-700">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── Letter from the editor ─── */}
      <section className="relative bg-paper py-24">
        <Container size="xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-700">
                <Quote className="h-3.5 w-3.5" />
                Carta del editor
              </p>
              <h2 className="mt-5 font-display text-[clamp(2.25rem,5vw,3.75rem)] italic leading-[1.02] text-white text-balance">
                <span className="text-gray-400">Las leyes cambian.</span>
                <br />
                Las historias permanecen.
              </h2>
              <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 ring-1 ring-white/10 shadow-sm">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-50 text-gold-700 ring-1 ring-gold-300">
                  M
                </span>
                <div className="flex flex-col">
                  <span className="text-[12.5px] font-semibold text-white">
                    Manuel Solís
                  </span>
                  <span className="text-[10.5px] uppercase tracking-[0.22em] text-gray-500">
                    Editor fundador
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-5 text-[16px] leading-[1.8] text-gray-700 text-pretty">
              <p className="first-letter:font-display first-letter:italic first-letter:text-6xl first-letter:leading-none first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-gold-700">
                La ley migratoria estadounidense es complicada, lenta, y a veces injusta, pero las
                personas que la navegan son mucho más que su expediente. Documentamos sus procesos
                con rigor y con respeto, y procuramos que quien nos mire desde su casa se sienta
                mejor equipado para entender su propio camino.
              </p>
              <p>
                Cada episodio que producimos parte de una pregunta: ¿qué necesita saber alguien que
                vive un proceso similar al de esta familia? Buscamos contestarla sin
                sentimentalismo y sin tecnicismos vacíos.
              </p>
              <p className="text-gray-500 text-[15px]">
                Looms Originals no es un sustituto de la asesoría legal. Nuestro contenido es
                informativo. Si su caso es similar al de alguna de las familias que verá, le
                invitamos a agendar una consulta con el equipo de la firma.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── Process timeline ─── */}
      <section className="bg-paper py-24 border-t border-gray-200">
        <Container size="xl">
          <div className="grid items-end gap-10 md:grid-cols-[1fr_auto] mb-14">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-700">
                <span className="h-px w-8 bg-gold-500" />
                Proceso editorial
              </p>
              <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.5rem)] italic leading-[0.98] text-white text-balance">
                Cómo se hace un episodio
              </h2>
            </div>
            <p className="max-w-md text-[15.5px] leading-[1.7] text-gray-600 text-pretty md:text-right">
              Cinco pasos, entre 8 y 14 semanas por episodio. Sin atajos.
            </p>
          </div>

          <ol className="grid gap-5 md:grid-cols-5">
            {PROCESS.map((step, i) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.title}
                  className="group relative flex flex-col rounded-3xl glass-card p-6 transition-all duration-500 ease-apple hover:-translate-y-1 hover:ring-gold-400/60 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-gold-700">
                      {step.label}
                    </span>
                    <span className="font-display text-2xl italic leading-none text-gray-300 group-hover:text-gold-500 transition-colors">
                      0{i + 1}
                    </span>
                  </div>
                  <div className="mt-5 grid h-11 w-11 place-items-center rounded-2xl glass-card text-gold-700 transition-transform duration-500 group-hover:rotate-[-6deg] group-hover:scale-105">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </div>
                  <h3 className="mt-4 font-display text-xl italic leading-tight text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-[1.6] text-gray-600 text-pretty">
                    {step.body}
                  </p>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      {/* ─── Principles grid ─── */}
      <section className="bg-paper py-24">
        <Container size="xl">
          <div className="grid items-end gap-10 md:grid-cols-[1fr_auto] mb-14">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-700">
                <span className="h-px w-8 bg-gold-500" />
                Principios
              </p>
              <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.5rem)] italic leading-[0.98] text-white text-balance">
                Cómo trabajamos
              </h2>
            </div>
            <p className="max-w-md text-[15.5px] leading-[1.7] text-gray-600 text-pretty md:text-right">
              Cuatro reglas internas que regulan toda producción editorial de Looms.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {PRINCIPLES.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="group relative overflow-hidden rounded-3xl glass-card p-7 transition-all duration-500 ease-apple hover:-translate-y-1 hover:ring-gold-400/60 hover:shadow-md"
                >
                  <span className="absolute right-6 top-6 font-display text-2xl italic leading-none text-gray-300 group-hover:text-gold-500 transition-colors">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-paper ring-1 ring-white/10 text-gold-700 transition-transform duration-500 group-hover:rotate-[-4deg] group-hover:scale-105">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </div>
                  <h3 className="mt-5 font-display text-2xl italic leading-tight text-white">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-[14.5px] leading-[1.65] text-gray-600 text-pretty">
                    {p.body}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ─── Testimonials grid ─── */}
      <section className="bg-paper py-24 border-t border-gray-200">
        <Container size="xl">
          <div className="grid items-end gap-10 md:grid-cols-[1fr_auto] mb-14">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-700">
                <Star className="h-3.5 w-3.5 fill-current" />
                Voces
              </p>
              <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.5rem)] italic leading-[0.98] text-white text-balance">
                Lo que dicen las familias
              </h2>
            </div>
            <p className="max-w-md text-[15.5px] leading-[1.7] text-gray-600 text-pretty md:text-right">
              Tres testimonios entre cientos de cartas que recibimos cada año.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <figure
                key={i}
                className="group relative flex h-full flex-col rounded-3xl glass-card p-7 transition-all duration-500 ease-apple hover:-translate-y-1 hover:ring-gold-400/60 hover:shadow-md"
              >
                <span className="font-display text-5xl italic leading-none text-gold-500 select-none">
                  “
                </span>
                <blockquote className="-mt-3 flex-1 font-display italic text-[17px] leading-[1.4] text-white text-pretty">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 border-t border-gray-200 pt-4">
                  <p className="font-display text-lg italic text-white">{t.by}</p>
                  <p className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-gold-700">
                    {t.role}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── Coverage / reach ─── */}
      <section className="bg-paper py-24">
        <Container size="xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:items-start lg:gap-20">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-700">
                <Globe className="h-3.5 w-3.5" />
                Alcance editorial
              </p>
              <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.5rem)] italic leading-[0.98] text-white text-balance">
                Una historia <br />
                <span className="text-gold-gradient">por estado.</span>
              </h2>
              <p className="mt-6 max-w-md text-[15.5px] leading-[1.7] text-gray-600 text-pretty">
                Documentamos casos en todo Estados Unidos. Estos son los seis estados con mayor
                volumen de testimonios verificados.
              </p>
              <ButtonLink href="/series" variant="ghost" size="md" className="mt-7">
                Ver el catálogo
                <ChevronRight className="h-4 w-4" />
              </ButtonLink>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {COVERAGE.map((c, i) => (
                <li
                  key={c.region}
                  className="group flex items-center gap-4 rounded-2xl bg-white px-5 py-4 ring-1 ring-white/10 transition-all duration-500 ease-apple hover:-translate-y-0.5 hover:ring-gold-400/60 hover:shadow-md"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-paper ring-1 ring-white/10 text-gold-700">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg italic leading-tight text-white">
                      {c.region}
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-gray-500">{c.note}</p>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-gray-300">
                    0{i + 1}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* ─── Pull quote ─── */}
      <section className="relative overflow-hidden bg-paper py-24 border-t border-gray-200">
        <Container size="xl">
          <figure className="mx-auto max-w-4xl text-center">
            <span className="font-display text-[6rem] italic leading-none text-gold-400 select-none">
              “
            </span>
            <blockquote className="-mt-6 font-display text-[clamp(1.5rem,3.2vw,2.5rem)] italic leading-[1.3] text-white text-balance">
              Cada serie nace de una promesa: contar la inmigración con la dignidad de quien la
              vive, no con la urgencia del ciclo de noticias.
            </blockquote>
            <figcaption className="mt-8 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-700">
              Manifiesto editorial · Looms Originals
            </figcaption>
          </figure>
        </Container>
      </section>

      {/* ─── CTA buttons ─── */}
      <section className="bg-paper py-24">
        <Container size="md" className="text-center">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-700">
            <span className="h-px w-8 bg-gold-500" />
            Próximo paso
          </p>
          <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.25rem)] italic text-white leading-[1] text-balance">
            ¿Listo para conocer las historias?
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/series" variant="primary" size="lg">
              Ver el catálogo
              <ChevronRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink
              href={withUtm(SITE.lawFirm.consultationUrl, {
                source: "looms",
                medium: "about",
                campaign: "consulta",
              })}
              variant="ghost"
              size="lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Agendar consulta
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
      </section>

      {/* ─── FAQ ─── */}
      <section className="border-t border-gray-200 bg-paper py-24">
        <Container size="md">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-700">
            <span className="h-px w-8 bg-gold-500" />
            Preguntas frecuentes
          </p>
          <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3rem)] italic text-white leading-[1.05] text-balance">
            Lo que la gente pregunta sobre Looms
          </h2>
          <div className="mt-10 space-y-3">
            {FAQS.map((f) => (
              <details
                key={f.question}
                className="group rounded-2xl bg-paper ring-1 ring-white/10 open:shadow-md transition-shadow"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left font-medium text-white list-none">
                  <span className="text-[16px]">{f.question}</span>
                  <span className="h-6 w-6 shrink-0 rounded-full border border-gray-300 grid place-items-center text-gray-500 group-open:border-gold-400 group-open:text-gold-700 group-open:rotate-45 transition-all">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-6 text-[15px] leading-relaxed text-gray-600">
                  {f.answer}
                </div>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

function MetaCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="lift-card rounded-2xl bg-white/85 backdrop-blur-md ring-1 ring-white/10 px-5 py-4 hover:ring-gold-400/60">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.26em] text-gold-700">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl italic leading-tight text-white">{value}</p>
      <p className="mt-1 text-[12.5px] text-gray-500">{hint}</p>
    </div>
  );
}
