import Link from "next/link";
import { Scale, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { SITE } from "@/lib/site";
import { withUtm } from "@/lib/utils";

const cols = [
  {
    heading: "Loom Originals",
    links: [
      { href: "/sobre", label: "Sobre Loom" },
      { href: "/series", label: "Series" },
      { href: "/categorias", label: "Categorías" },
      { href: "/buscar", label: "Buscar" },
      { href: "/feed.xml", label: "RSS" },
    ],
  },
  {
    heading: "Bufete Manuel Solís",
    external: true,
    links: [
      {
        href: withUtm(SITE.lawFirm.url, { source: "looms", medium: "footer", campaign: "home" }),
        label: "Sitio oficial del bufete",
      },
      {
        href: withUtm(SITE.lawFirm.consultationUrl, {
          source: "looms",
          medium: "footer",
          campaign: "consulta",
        }),
        label: "Agendar consulta gratuita",
      },
      {
        href: withUtm(SITE.lawFirm.reviewsUrl, {
          source: "looms",
          medium: "footer",
          campaign: "reviews",
        }),
        label: "Leer reseñas de clientes",
      },
      { href: SITE.lawFirm.whatsapp, label: "WhatsApp del bufete" },
      { href: `tel:${SITE.lawFirm.phone}`, label: SITE.lawFirm.phoneDisplay },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacidad", label: "Privacidad" },
      { href: "/terminos", label: "Términos" },
      { href: "/cookies", label: "Política de cookies" },
      { href: "/contacto", label: "Contacto" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-gray-200 bg-paper">
      <Container size="xl" className="py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo subtitle className="scale-110 origin-left" />
            <p className="mt-5 text-sm leading-relaxed text-gray-600 text-pretty">
              Un estudio editorial de historias migrantes. Serie insignia:{" "}
              <span className="italic text-ink">Uniendo Familias con Manuel Solís</span>. Producido
              por Bufete Manuel Solís, firma líder en inmigración en Estados Unidos.
            </p>
            <div className="mt-6 flex items-center gap-1">
              <SocialIcon href={SITE.social.youtube} label="YouTube">
                <YouTubeIcon className="h-[18px] w-[18px]" />
              </SocialIcon>
              <SocialIcon href={SITE.social.instagram} label="Instagram">
                <InstagramIcon className="h-[18px] w-[18px]" />
              </SocialIcon>
              <SocialIcon href={SITE.social.tiktok} label="TikTok">
                <TikTokIcon className="h-[18px] w-[18px]" />
              </SocialIcon>
              <SocialIcon href={SITE.social.facebook} label="Facebook">
                <FacebookIcon className="h-[18px] w-[18px]" />
              </SocialIcon>
            </div>
            <a
              href={withUtm(SITE.lawFirm.reviewsUrl, {
                source: "looms",
                medium: "footer-badge",
                campaign: "reviews",
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-50 px-4 py-2 text-[12px] font-medium text-gold-700 hover:bg-gold-100 transition-colors"
            >
              <Star className="h-3.5 w-3.5 fill-current" />
              Ver reseñas de clientes
            </a>
          </div>
          {cols.map((col) => (
            <div key={col.heading}>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-700">
                {col.heading}
              </h4>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => {
                  const external = "external" in col && col.external;
                  return (
                    <li key={link.href}>
                      {external || link.href.startsWith("http") || link.href.startsWith("tel:") ? (
                        <a
                          href={link.href}
                          className="text-sm text-gray-600 transition-colors hover:text-ink"
                          target={link.href.startsWith("tel:") ? undefined : "_blank"}
                          rel="noopener noreferrer"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-gray-600 transition-colors hover:text-ink"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-6 border-t border-gray-200 pt-8 md:flex-row md:items-center">
          <div className="flex items-center gap-3 text-[13px] text-gray-500">
            <Scale className="h-4 w-4 text-gold-600" />
            <p>
              Una producción de{" "}
              <a
                href={withUtm(SITE.lawFirm.url, {
                  source: "looms",
                  medium: "footer",
                  campaign: "attribution",
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink hover:text-gold-700"
              >
                Bufete Manuel Solís
              </a>
              . © {new Date().getFullYear()} Loom Originals.
            </p>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-gray-500">
            El contenido en esta plataforma es informativo y no constituye asesoría legal. Cada caso
            migratorio es único. Consulte con un abogado licenciado antes de tomar decisiones.
          </p>
        </div>
      </Container>
    </footer>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="grid h-10 w-10 place-items-center rounded-full text-gray-600 transition-all hover:bg-gray-100 hover:text-ink hover:scale-110"
    >
      {children}
    </a>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1Z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1 31.6 31.6 0 0 0 .5-5.8 31.6 31.6 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
    </svg>
  );
}
