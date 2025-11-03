import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { z } from "zod";

const memberSchema = z.object({
  user: z.object({
    id: z.string(),
    username: z.string(),
    global_name: z.string().nullable().optional(),
    avatar: z.string().nullable().optional()
  }),
  joined_at: z.string().optional()
});

export type GuildMember = z.infer<typeof memberSchema>;

export async function fetchGuildMembers(accessToken: string, guildId: string): Promise<GuildMember[]> {
  const rest = new REST({ version: "10" }).setToken(accessToken);
  const response = (await rest.get(Routes.guildMembers(guildId), {
    query: new URLSearchParams({ limit: "200" })
  })) as unknown;

  const parsed = z.array(memberSchema).safeParse(response);
  if (!parsed.success) {
    console.error(parsed.error.flatten());
    throw new Error("Failed to parse Discord guild members payload");
  }

  return parsed.data;
}
