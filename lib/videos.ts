import { supabaseServerClient } from "@/lib/supabaseServerClient";

export type FeaturedVideo = {
  id: string;
  title: string;
  playback_url: string;
  duration_seconds: number;
  tags: string[] | null;
  thumbnail_url: string | null;
};

const supabaseEnabled = process.env.SUPABASE_ENABLED === "true";

const fallbackVideos: FeaturedVideo[] = [
  {
    id: "demo-1",
    title: "Tough Crowd Laughs",
    playback_url: "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4",
    duration_seconds: 60,
    tags: ["comedy", "crew"],
    thumbnail_url: null
  },
  {
    id: "demo-2",
    title: "Epic High-Five Fail",
    playback_url: "https://storage.googleapis.com/coverr-main/mp4/Street-Lights.mp4",
    duration_seconds: 45,
    tags: ["funny", "fails"],
    thumbnail_url: null
  }
];

export async function listFeaturedVideos(): Promise<FeaturedVideo[]> {
  if (!supabaseEnabled) {
    return fallbackVideos;
  }

  const supabase = supabaseServerClient();
  const { data, error } = await supabase
    .from("videos")
    .select("id,title,playback_url,duration_seconds,tags,thumbnail_url")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    console.error("[listFeaturedVideos]", error);
    throw error;
  }

  return data ?? [];
}
