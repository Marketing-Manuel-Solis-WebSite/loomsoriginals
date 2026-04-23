import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminNav } from "./AdminNav";
import { isAdminUser, getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/ui/Logo";

export const metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/admin");
  const ok = await isAdminUser();
  if (!ok) redirect("/");

  return (
    <div className="flex min-h-dvh bg-navy-950">
      <aside className="hidden w-60 shrink-0 border-r border-white/5 bg-navy-900/60 md:flex flex-col">
        <Link href="/admin" className="flex items-center gap-2 border-b border-white/5 px-6 py-5">
          <Logo />
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-500">Admin</span>
        </Link>
        <AdminNav />
        <div className="mt-auto border-t border-white/5 px-6 py-4">
          <p className="text-[11px] uppercase tracking-widest text-ivory-200/60">Sesión</p>
          <p className="mt-1 truncate text-[13px] text-ivory-100">{user.email}</p>
          <form action="/api/auth/signout" method="post" className="mt-3">
            <button
              type="submit"
              className="text-[12px] font-medium text-gold-500 hover:text-gold-400"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden px-6 py-10 sm:px-10 md:px-14">{children}</main>
    </div>
  );
}
