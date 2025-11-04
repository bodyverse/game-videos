import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { fetchGuildMembers } from "@/lib/discord";
import { supabaseAdmin } from "@/lib/supabaseServerClient";

const bodySchema = z.object({
  guildId: z.string()
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !session.discordAccessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const result = bodySchema.safeParse(json);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    const members = await fetchGuildMembers(session.discordAccessToken, result.data.guildId);
    if (members.length === 0) {
      return NextResponse.json({ message: "No members returned from Discord" }, { status: 200 });
    }

    const simplifiedMembers = members.map((member) => ({
      discordId: member.user.id,
      username: member.user.username,
      globalName: member.user.global_name ?? null,
      avatar: member.user.avatar ?? null
    }));

    const upsertPayload = members.map((member) => ({
      user_uid: session.user.id,
      friend_discord_id: member.user.id,
      friend_username: member.user.username,
      friend_avatar: member.user.avatar ?? null
    }));

    if (supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from("friendships")
        .upsert(upsertPayload, { onConflict: "user_uid,friend_discord_id" });
      if (error) throw error;
    }

    return NextResponse.json({
      synced: supabaseAdmin ? upsertPayload.length : simplifiedMembers.length,
      members: simplifiedMembers
    });
  } catch (error) {
    console.error("[discord/friends] sync failed", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
