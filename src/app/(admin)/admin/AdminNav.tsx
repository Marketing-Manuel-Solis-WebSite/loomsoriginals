"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Film, Layers, List, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Resumen", icon: BarChart3 },
  { href: "/admin/series", label: "Series", icon: Film },
  { href: "/admin/episodios", label: "Episodios", icon: List },
  { href: "/admin/categorias", label: "Categorías", icon: Tag },
  { href: "/admin/analiticas", label: "Analíticas", icon: Layers },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegación admin" className="flex flex-col gap-0.5 p-3">
      {items.map((it) => {
        const active = pathname === it.href || pathname.startsWith(`${it.href}/`);
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[14px] font-medium transition-colors",
              active
                ? "bg-gold-500/10 text-gold-400"
                : "text-ivory-200 hover:bg-white/5 hover:text-ivory-50"
            )}
          >
            <Icon className="h-4 w-4" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
