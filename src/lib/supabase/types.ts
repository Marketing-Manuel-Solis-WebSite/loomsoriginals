export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      series: {
        Row: {
          id: string;
          slug: string;
          title_es: string;
          title_en: string | null;
          synopsis_es: string | null;
          synopsis_en: string | null;
          poster_url: string | null;
          backdrop_url: string | null;
          trailer_youtube_id: string | null;
          release_year: number | null;
          is_featured: boolean;
          featured_order: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title_es: string;
          title_en?: string | null;
          synopsis_es?: string | null;
          synopsis_en?: string | null;
          poster_url?: string | null;
          backdrop_url?: string | null;
          trailer_youtube_id?: string | null;
          release_year?: number | null;
          is_featured?: boolean;
          featured_order?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["series"]["Insert"]>;
        Relationships: [];
      };
      seasons: {
        Row: {
          id: string;
          series_id: string;
          season_number: number;
          title_es: string | null;
          title_en: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          series_id: string;
          season_number: number;
          title_es?: string | null;
          title_en?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["seasons"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "seasons_series_id_fkey";
            columns: ["series_id"];
            isOneToOne: false;
            referencedRelation: "series";
            referencedColumns: ["id"];
          }
        ];
      };
      episodes: {
        Row: {
          id: string;
          season_id: string;
          series_id: string;
          episode_number: number;
          slug: string;
          title_es: string;
          title_en: string | null;
          synopsis_es: string | null;
          synopsis_en: string | null;
          youtube_id: string;
          thumbnail_url: string | null;
          duration_seconds: number | null;
          transcript_es: string | null;
          transcript_en: string | null;
          published_at: string | null;
          is_published: boolean;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          season_id: string;
          series_id: string;
          episode_number: number;
          slug: string;
          title_es: string;
          title_en?: string | null;
          synopsis_es?: string | null;
          synopsis_en?: string | null;
          youtube_id: string;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          transcript_es?: string | null;
          transcript_en?: string | null;
          published_at?: string | null;
          is_published?: boolean;
          tags?: string[];
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["episodes"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "episodes_season_id_fkey";
            columns: ["season_id"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "episodes_series_id_fkey";
            columns: ["series_id"];
            isOneToOne: false;
            referencedRelation: "series";
            referencedColumns: ["id"];
          }
        ];
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name_es: string;
          name_en: string | null;
          description_es: string | null;
          description_en: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name_es: string;
          name_en?: string | null;
          description_es?: string | null;
          description_en?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      episode_categories: {
        Row: { episode_id: string; category_id: string };
        Insert: { episode_id: string; category_id: string };
        Update: Partial<{ episode_id: string; category_id: string }>;
        Relationships: [
          {
            foreignKeyName: "episode_categories_episode_id_fkey";
            columns: ["episode_id"];
            isOneToOne: false;
            referencedRelation: "episodes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "episode_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          preferred_language: string;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          preferred_language?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      watch_history: {
        Row: {
          id: string;
          user_id: string;
          episode_id: string;
          progress_seconds: number;
          completed: boolean;
          last_watched_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          episode_id: string;
          progress_seconds?: number;
          completed?: boolean;
          last_watched_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["watch_history"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "watch_history_episode_id_fkey";
            columns: ["episode_id"];
            isOneToOne: false;
            referencedRelation: "episodes";
            referencedColumns: ["id"];
          }
        ];
      };
      favorites: {
        Row: { user_id: string; series_id: string; created_at: string };
        Insert: { user_id: string; series_id: string; created_at?: string };
        Update: Partial<{ user_id: string; series_id: string; created_at: string }>;
        Relationships: [
          {
            foreignKeyName: "favorites_series_id_fkey";
            columns: ["series_id"];
            isOneToOne: false;
            referencedRelation: "series";
            referencedColumns: ["id"];
          }
        ];
      };
      video_events: {
        Row: {
          id: string;
          user_id: string | null;
          episode_id: string;
          event_type: string;
          progress_seconds: number | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          episode_id: string;
          event_type: string;
          progress_seconds?: number | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["video_events"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "video_events_episode_id_fkey";
            columns: ["episode_id"];
            isOneToOne: false;
            referencedRelation: "episodes";
            referencedColumns: ["id"];
          }
        ];
      };
      cta_clicks: {
        Row: {
          id: string;
          user_id: string | null;
          episode_id: string | null;
          cta_type: string;
          destination_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          episode_id?: string | null;
          cta_type: string;
          destination_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cta_clicks"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Series = Tables<"series">;
export type Season = Tables<"seasons">;
export type Episode = Tables<"episodes">;
export type Category = Tables<"categories">;
export type Profile = Tables<"profiles">;
export type WatchHistory = Tables<"watch_history">;
export type Favorite = Tables<"favorites">;
