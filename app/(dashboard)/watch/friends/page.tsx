import { auth } from "@/auth";
import { supabaseServerClient } from "@/lib/supabaseServerClient";
import { FriendsClient } from "@/components/friends/FriendsClient";
import type { SyncedFriend } from "@/components/friends/FriendSyncForm";

const supabaseEnabled = process.env.SUPABASE_ENABLED === "true";

export default async function FriendsPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  let initialFriends: SyncedFriend[] = [];
  let initialError: string | null = null;

  if (supabaseEnabled) {
    try {
      const supabase = supabaseServerClient();
      const { data, error } = await supabase
        .from("friendships")
        .select("friend_discord_id, friend_username, friend_avatar")
        .eq("user_uid", session.user.id)
        .order("friend_username", { ascending: true });

      if (error) {
        throw error;
      }

      initialFriends =
        data?.map((friend) => ({
          discordId: friend.friend_discord_id,
          username: friend.friend_username,
          globalName: null,
          avatar: friend.friend_avatar
        })) ?? [];
    } catch (error) {
      console.error("[friends] failed to load cached list", error);
      initialError = "We couldn't reach Supabase. Try again shortly or check your connection.";
    }
  }

  return (
    <FriendsClient
      supabaseEnabled={supabaseEnabled}
      initialFriends={initialFriends}
      initialError={initialError}
    />
  );
}
