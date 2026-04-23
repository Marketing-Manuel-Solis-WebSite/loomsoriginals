"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Heart, LayoutDashboard, LogOut, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Me = {
  user: { id: string; email: string | null; name: string | null; avatar_url: string | null } | null;
  isAdmin: boolean;
};

export function AccountMenu({ locale }: { locale: "es" | "en" }) {
  const [me, setMe] = useState<Me | null>(null);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setMe(data);
      })
      .catch(() => {
        if (!cancelled) setMe({ user: null, isAdmin: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!me?.user) return null;

  const initial = (me.user.name ?? me.user.email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menú de cuenta"
        className="grid h-9 w-9 place-items-center rounded-full overflow-hidden ring-2 ring-gold-400/50 hover:ring-gold-400 transition-all hover:scale-105"
      >
        {me.user.avatar_url ? (
          <Image
            src={me.user.avatar_url}
            alt=""
            width={36}
            height={36}
            unoptimized
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span className="bg-gradient-to-br from-gold-300 to-gold-500 text-ink text-sm font-semibold h-full w-full grid place-items-center">
            {initial}
          </span>
        )}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-64 glass-strong rounded-2xl p-2 animate-rise"
        >
          <div className="px-3 py-3 border-b border-gray-200/60">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-600">
              Sesión activa
            </p>
            <p className="mt-1 truncate text-[13px] font-medium text-ink">
              {me.user.name ?? me.user.email}
            </p>
            {me.user.name && me.user.email ? (
              <p className="truncate text-[11px] text-gray-500">{me.user.email}</p>
            ) : null}
          </div>
          <nav className="flex flex-col py-1">
            {me.isAdmin ? (
              <MenuItem
                href="/admin"
                icon={<LayoutDashboard className="h-4 w-4" />}
                label="Panel de admin"
                highlight
                onClick={() => setOpen(false)}
              />
            ) : null}
            <MenuItem
              href={locale === "en" ? "/en/my-list" : "/mi-lista"}
              icon={<Heart className="h-4 w-4" />}
              label={locale === "en" ? "My list" : "Mi lista"}
              onClick={() => setOpen(false)}
            />
            <MenuItem
              href={locale === "en" ? "/en/profile" : "/perfil"}
              icon={<User className="h-4 w-4" />}
              label={locale === "en" ? "Profile" : "Perfil"}
              onClick={() => setOpen(false)}
            />
            {me.isAdmin ? (
              <MenuItem
                href="/admin/series"
                icon={<Settings className="h-4 w-4" />}
                label="Administrar series"
                onClick={() => setOpen(false)}
              />
            ) : null}
          </nav>
          <form
            action="/api/auth/signout"
            method="post"
            className="border-t border-gray-200/60 pt-1"
          >
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 hover:bg-gray-100 hover:text-ink transition-colors"
            >
              <LogOut className="h-4 w-4" />
              {locale === "en" ? "Sign out" : "Cerrar sesión"}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({
  href,
  icon,
  label,
  highlight,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  highlight?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors",
        highlight
          ? "text-gold-700 font-medium hover:bg-gold-50"
          : "text-ink hover:bg-gray-100"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
