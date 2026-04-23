import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getAllCategories } from "@/lib/queries/getCategories";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Categorías — Loom Originals",
  description:
    "Historias migrantes organizadas por categoría: reunificación familiar, asilo, visas de trabajo, ciudadanía, deportación y casos reales.",
  alternates: { canonical: "/categorias" },
};

export default async function CategoriasPage() {
  const categories = await getAllCategories().catch(() => []);
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE.url}/` },
          { name: "Categorías", url: `${SITE.url}/categorias` },
        ]}
      />
      <Container size="xl" className="pt-28 pb-24">
        <header className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-500">
            Navegación
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,4.5rem)] italic leading-none text-ivory-50">
            Categorías
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-ivory-200/85 text-pretty">
            Encuentre historias según el tipo de caso migratorio.
          </p>
        </header>
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/categorias/${c.slug}`}
                className="group glass block rounded-3xl p-8 transition-all duration-400 ease-apple hover:-translate-y-1 hover:border-gold-500/40"
              >
                <h2 className="font-display text-3xl italic text-ivory-50 group-hover:text-gold-500 transition-colors">
                  {c.name_es}
                </h2>
                {c.description_es ? (
                  <p className="mt-3 text-[14px] leading-relaxed text-ivory-200/80 text-pretty">
                    {c.description_es}
                  </p>
                ) : null}
                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-500">
                  Explorar →
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
