import { NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabaseServerClient";
import { listFeaturedVideos } from "@/lib/videos";

const supabaseEnabled = process.env.SUPABASE_ENABLED === "true";

export async function GET() {
  if (!supabaseEnabled) {
    const videos = await listFeaturedVideos();
    return NextResponse.json({ videos });
  }

  const supabase = supabaseServerClient();
  const { data, error } = await supabase
    .from("videos")
    .select("id,title,playback_url,duration_seconds,tags,thumbnail_url,is_featured")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[api/videos] fetch failed", error);
    return NextResponse.json({ error: "Unable to load videos" }, { status: 500 });
  }

  return NextResponse.json({ videos: data ?? [] });
}

export const revalidate = 60;
