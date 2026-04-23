import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type Params = Promise<{ episodeId: string }>;

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function EmbedPage({ params }: { params: Params }) {
  const { episodeId } = await params;
  const supabase = await getSupabaseServerClient();
  const { data: ep } = await supabase
    .from("episodes")
    .select("id, youtube_id, title_es, is_published")
    .eq("id", episodeId)
    .maybeSingle();
  if (!ep || !ep.is_published) notFound();

  return (
    <div className="fixed inset-0 bg-black">
      <iframe
        title={ep.title_es}
        src={`https://www.youtube-nocookie.com/embed/${ep.youtube_id}?modestbranding=1&rel=0&playsinline=1`}
        className="h-full w-full"
        loading="eager"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      />
    </div>
  );
}
