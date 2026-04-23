import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Información sobre las cookies que usa Loom Originals y cómo gestionarlas.",
  alternates: { canonical: "/cookies" },
};

const COOKIES: { name: string; purpose: string; retention: string }[] = [
  { name: "sb-*", purpose: "Sesión de Supabase (autenticación, carrito de 'Mi lista').", retention: "Hasta 30 días." },
  { name: "_ga / _ga_*", purpose: "Google Analytics 4 — métricas agregadas de uso.", retention: "24 meses." },
  { name: "_fbp", purpose: "Meta Pixel — atribución de campañas sociales.", retention: "90 días." },
  { name: "_ttp", purpose: "TikTok Pixel — atribución de campañas sociales.", retention: "13 meses." },
];

export default function CookiesPage() {
  return (
    <Container size="md" className="pt-28 pb-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-500">Legal</p>
      <h1 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] italic leading-tight text-ivory-50">
        Política de Cookies
      </h1>
      <p className="mt-3 text-sm text-ivory-200/70">Última actualización: 22 de abril de 2026</p>
      <p className="mt-8 text-[15.5px] leading-relaxed text-ivory-200/90 text-pretty">
        Usamos cookies para mantener su sesión y para medir el desempeño del sitio. Puede
        desactivarlas en la configuración de su navegador; algunas funciones (como &ldquo;Mi lista&rdquo;) no
        estarán disponibles.
      </p>
      <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-800 text-[11px] uppercase tracking-widest text-gold-500">
            <tr>
              <th className="px-4 py-3">Cookie</th>
              <th className="px-4 py-3">Propósito</th>
              <th className="px-4 py-3">Retención</th>
            </tr>
          </thead>
          <tbody>
            {COOKIES.map((c) => (
              <tr key={c.name} className="border-t border-white/5">
                <td className="px-4 py-3 font-mono text-gold-400">{c.name}</td>
                <td className="px-4 py-3 text-ivory-100">{c.purpose}</td>
                <td className="px-4 py-3 text-ivory-200/80">{c.retention}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
