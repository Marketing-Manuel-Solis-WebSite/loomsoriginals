import type { Series, Season, Episode, Category } from "@/lib/supabase/types";

export type EpisodeCard = Pick<
  Episode,
  | "id"
  | "slug"
  | "series_id"
  | "season_id"
  | "episode_number"
  | "title_es"
  | "title_en"
  | "synopsis_es"
  | "synopsis_en"
  | "youtube_id"
  | "thumbnail_url"
  | "duration_seconds"
  | "published_at"
  | "tags"
>;

export type SeriesCard = Pick<
  Series,
  | "id"
  | "slug"
  | "title_es"
  | "title_en"
  | "synopsis_es"
  | "synopsis_en"
  | "poster_url"
  | "backdrop_url"
  | "trailer_youtube_id"
  | "release_year"
  | "is_featured"
  | "featured_order"
>;

export type SeriesDetail = SeriesCard & {
  seasons: (Season & { episodes: EpisodeCard[] })[];
};

export type EpisodeDetail = Episode & {
  series: Series;
  season: Season;
  categories: Category[];
};

export type CategoryWithEpisodes = Category & {
  episodes: (EpisodeCard & { series: Pick<Series, "slug" | "title_es" | "title_en"> })[];
};
