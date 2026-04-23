"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV } from "@/lib/site";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const locale: "es" | "en" = pathname?.startsWith("/en") ? "en" : "es";
  const links = NAV[locale];

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-4px 0px 0px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="h-px w-full" />
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-apple",
          scrolled ? "glass-strong" : "bg-gradient-to-b from-navy-950/80 via-navy-950/40 to-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-10">
            <Link href={locale === "en" ? "/en" : "/"} className="shrink-0" aria-label="Loom Originals">
              <Logo subtitle />
            </Link>
            <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-8">
              {links.map((link) => {
                const active =
                  pathname === link.href ||
                  (link.href !== "/" && link.href !== "/en" && pathname?.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative text-[13.5px] font-medium uppercase tracking-[0.12em] transition-colors",
                      active ? "text-gold-500" : "text-ivory-200 hover:text-ivory-50"
                    )}
                  >
                    {link.label}
                    {active ? (
                      <span className="absolute -bottom-1.5 left-0 right-0 mx-auto h-px w-4 bg-gold-500" />
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <LocaleSwitcher locale={locale} pathname={pathname ?? "/"} />
            <Link
              href={locale === "en" ? "/en/search" : "/buscar"}
              aria-label="Buscar"
              className="hidden sm:grid h-10 w-10 place-items-center rounded-full text-ivory-200 hover:text-gold-500 hover:bg-white/5 transition-colors"
            >
              <Search className="h-[18px] w-[18px]" />
            </Link>
            <ButtonLink
              href={locale === "en" ? "/en/login" : "/login"}
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex"
            >
              {locale === "en" ? "Sign in" : "Iniciar sesión"}
            </ButtonLink>
            <button
              type="button"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="md:hidden grid h-10 w-10 place-items-center rounded-full text-ivory-50 hover:bg-white/5"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        id="mobile-menu"
        open={open}
        onClose={() => setOpen(false)}
        links={links}
        locale={locale}
      />
      <div aria-hidden className="h-16" />
    </>
  );
}

function LocaleSwitcher({ locale, pathname }: { locale: "es" | "en"; pathname: string }) {
  const baseEn = pathname.startsWith("/en") ? pathname : `/en${pathname === "/" ? "" : pathname}`;
  const baseEs = pathname.startsWith("/en") ? pathname.replace(/^\/en/, "") || "/" : pathname;
  return (
    <div
      role="group"
      aria-label="Cambiar idioma"
      className="flex items-center gap-0.5 rounded-full border border-white/8 bg-white/[0.03] p-0.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
    >
      <Link
        href={baseEs}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          locale === "es" ? "bg-gold-500 text-navy-950" : "text-ivory-200 hover:text-ivory-50"
        )}
      >
        ES
      </Link>
      <Link
        href={baseEn}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          locale === "en" ? "bg-gold-500 text-navy-950" : "text-ivory-200 hover:text-ivory-50"
        )}
      >
        EN
      </Link>
    </div>
  );
}

function MobileMenu({
  id,
  open,
  onClose,
  links,
  locale,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
  links: readonly { href: string; label: string }[];
  locale: "es" | "en";
}) {
  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-40 md:hidden transition-opacity duration-400 ease-apple",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="absolute inset-0 bg-navy-950/95 backdrop-blur-xl" onClick={onClose} />
      <div className="absolute inset-x-0 top-16 bottom-0 flex flex-col px-6 pt-10 pb-12">
        <nav className="flex flex-col gap-1">
          {links.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                "font-display text-5xl italic text-ivory-50 hover:text-gold-500 transition-colors py-3",
                open ? "animate-rise" : ""
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          <ButtonLink href={locale === "en" ? "/en/login" : "/login"} variant="primary" size="lg">
            {locale === "en" ? "Sign in" : "Iniciar sesión"}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
