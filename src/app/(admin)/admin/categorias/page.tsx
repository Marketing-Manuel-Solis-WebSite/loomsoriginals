import { getSupabaseServiceClient } from "@/lib/supabase/server";

export default async function AdminCategoriasPage() {
  const supabase = await getSupabaseServiceClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name_es, description_es")
    .order("name_es", { ascending: true });
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-500">Categorías</p>
      <h1 className="mt-2 font-display text-4xl italic text-ivory-50">Categorías</h1>
      <p className="mt-3 text-sm text-ivory-200/70">
        La gestión de categorías es de alta frecuencia baja; para agregar o editar use el editor SQL
        de Supabase o el endpoint. Listado actual:
      </p>
      <ul className="mt-8 divide-y divide-white/5 rounded-2xl border border-white/5 bg-navy-900/40">
        {(categories ?? []).map((c) => (
          <li key={c.id} className="px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg italic text-ivory-50">{c.name_es}</span>
              <span className="font-mono text-xs text-gold-400">/categorias/{c.slug}</span>
            </div>
            {c.description_es ? (
              <p className="mt-1 text-sm text-ivory-200/70">{c.description_es}</p>
            ) : null}
          </li>
        ))}
        {(!categories || categories.length === 0) && (
          <li className="px-5 py-8 text-center text-ivory-200/70">Sin categorías.</li>
        )}
      </ul>
    </div>
  );
}
