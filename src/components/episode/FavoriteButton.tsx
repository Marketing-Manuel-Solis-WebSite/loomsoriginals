"use client";

import { useEffect, useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { trackCtaClick } from "@/lib/tracking";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  seriesId,
  label = "Añadir a mi lista",
  activeLabel = "En mi lista",
}: {
  seriesId: string;
  label?: string;
  activeLabel?: string;
}) {
  const [active, setActive] = useState<boolean | null>(null);
  const [authed, setAuthed] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabaseBrowserClient();
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!auth.user) {
        setActive(false);
        setAuthed(false);
        return;
      }
      setAuthed(true);
      const { data } = await supabase
        .from("favorites")
        .select("series_id")
        .eq("user_id", auth.user.id)
        .eq("series_id", seriesId)
        .maybeSingle();
      if (!cancelled) setActive(Boolean(data));
    })();
    return () => {
      cancelled = true;
    };
  }, [seriesId]);

  const toggle = () => {
    if (!authed) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    if (active === null) return;
    startTransition(async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      if (active) {
        await supabase.from("favorites").delete().eq("user_id", auth.user.id).eq("series_id", seriesId);
        setActive(false);
        trackCtaClick("subscribe", "favorites-off");
      } else {
        await supabase.from("favorites").insert({ user_id: auth.user.id, series_id: seriesId });
        setActive(true);
        trackCtaClick("subscribe", "favorites-on");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={active ?? undefined}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[13px] font-medium transition-colors",
        active
          ? "border-gold-500 bg-gold-500/10 text-gold-400"
          : "border-white/15 text-ivory-100 hover:border-gold-500/50 hover:text-gold-400"
      )}
    >
      <Heart className="h-4 w-4" fill={active ? "currentColor" : "none"} />
      {active ? activeLabel : label}
    </button>
  );
}
