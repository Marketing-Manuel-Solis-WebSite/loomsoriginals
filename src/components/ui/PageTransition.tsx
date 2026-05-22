"use client";

import { usePathname } from "next/navigation";

/**
 * Transición de vista ligera: al cambiar de ruta, el contenido se remonta y entra
 * con un fade suave (`animate-fade`). Reduced-motion lo desactiva (globals.css).
 * No usa el `<ViewTransition>` de React (no disponible en React 19.2.4).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-fade">
      {children}
    </div>
  );
}
