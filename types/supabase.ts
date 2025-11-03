export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string;
          title: string;
          playback_url: string;
          duration_seconds: number;
          tags: string[] | null;
          thumbnail_url: string | null;
          is_featured: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          playback_url: string;
          duration_seconds: number;
          tags?: string[] | null;
          thumbnail_url?: string | null;
          is_featured?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["videos"]["Insert"]>;
      };
      video_sessions: {
        Row: {
          id: string;
          owner_uid: string;
          video_id: string;
          started_at: string;
          status: "pending" | "live" | "ended";
        };
        Insert: {
          id?: string;
          owner_uid: string;
          video_id: string;
          started_at?: string;
          status?: "pending" | "live" | "ended";
        };
        Update: Partial<Database["public"]["Tables"]["video_sessions"]["Insert"]>;
      };
      session_participants: {
        Row: {
          id: string;
          session_id: string;
          user_uid: string;
          joined_at: string;
          last_seen_at: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_uid: string;
          joined_at?: string;
          last_seen_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["session_participants"]["Insert"]>;
      };
      session_events: {
        Row: {
          id: string;
          session_id: string;
          actor_uid: string;
          event_type: string;
          payload: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          actor_uid: string;
          event_type: string;
          payload?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["session_events"]["Insert"]>;
      };
      discord_profiles: {
        Row: {
          user_uid: string;
          discord_id: string;
          username: string;
          global_name: string | null;
          avatar: string | null;
          synced_at: string;
        };
        Insert: {
          user_uid: string;
          discord_id: string;
          username: string;
          global_name?: string | null;
          avatar?: string | null;
          synced_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["discord_profiles"]["Insert"]>;
      };
      friendships: {
        Row: {
          id: string;
          user_uid: string;
          friend_discord_id: string;
          friend_username: string;
          friend_avatar: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_uid: string;
          friend_discord_id: string;
          friend_username: string;
          friend_avatar?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["friendships"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
