import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "./ProfileForm";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Perfil",
  description: "Administre su nombre, idioma y foto en Loom Originals.",
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
    <Container size="md" className="pt-28 pb-24">
      <header className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-500">Cuenta</p>
        <h1 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] italic leading-tight text-ivory-50">
          Su perfil
        </h1>
        <p className="mt-3 text-[15px] text-ivory-200/80">{user.email}</p>
      </header>
      <div className="glass-strong mt-10 rounded-3xl px-8 py-10">
        <ProfileForm
          defaultValues={{
            display_name: profile?.display_name ?? "",
            preferred_language: profile?.preferred_language ?? "es",
            avatar_url: profile?.avatar_url ?? "",
          }}
        />
      </div>
    </Container>
  );
}
