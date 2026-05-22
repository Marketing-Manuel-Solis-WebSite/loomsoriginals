import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "./ProfileForm";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { UserCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Perfil",
  description: "Administre su nombre, idioma y foto en Looms Originals.",
  robots: { index: false, follow: false },
};

export default async function PerfilPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/perfil");

  const supabase = await getSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, preferred_language")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <>
      <section className="relative overflow-hidden bg-paper pt-32 pb-16 md:pt-40 md:pb-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-gold-100/70 blur-[140px]"
        />
        <Container size="md" className="relative">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-700">
            <UserCircle2 className="h-3.5 w-3.5" />
            Su cuenta
          </p>
          <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,4.5rem)] italic leading-[0.95] tracking-[-0.018em] text-white text-balance">
            Su <span className="text-gold-gradient">perfil</span>
          </h1>
          <p className="mt-4 text-[15px] text-gray-600">{user.email}</p>
        </Container>
      </section>

      <section className="bg-paper pb-24 border-t border-gray-200">
        <Container size="md" className="-mt-10 sm:-mt-14">
          <div className="rounded-3xl glass-card shadow-[0_30px_60px_-30px_rgba(9,9,11,0.18)] px-7 py-10 sm:px-10 sm:py-12">
            <ProfileForm
              defaultValues={{
                display_name: profile?.display_name ?? "",
                preferred_language: profile?.preferred_language ?? "es",
                avatar_url: profile?.avatar_url ?? "",
              }}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
