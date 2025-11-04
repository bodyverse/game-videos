import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { SupabaseAdapter } from "@auth/supabase-adapter";

const requiredEnv = [
  "DISCORD_CLIENT_ID",
  "DISCORD_CLIENT_SECRET"
] as const;

requiredEnv.forEach((name) => {
  if (!process.env[name]) {
    console.warn(`[authOptions] Missing environment variable: ${name}`);
  } else {
    if (process.env.NODE_ENV === "development") {
      console.log(`[authOptions] ${name} loaded`);
    }
  }
});

const supabaseEnabled = process.env.SUPABASE_ENABLED === "true";

export const authOptions: NextAuthOptions = {
  ...(supabaseEnabled &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY
    ? {
        adapter: SupabaseAdapter({
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          secret: process.env.SUPABASE_SERVICE_ROLE_KEY
        })
      }
    : {}),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify email guilds" } }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account?.access_token) {
        token.discordAccessToken = account.access_token;
        token.discordRefreshToken = account.refresh_token;
        token.discordExpiresAt = account.expires_at;
      }
      if (user) {
        token.id = user.id ?? token.sub ?? account?.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      if (token.discordAccessToken) {
        session.discordAccessToken = token.discordAccessToken as string;
      }
      return session;
    }
  },
  events: {
    error(message) {
      console.error("[next-auth][event.error]", message);
    }
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, metadata) {
      console.error("[next-auth][error]", code, metadata);
    },
    warn(code) {
      console.warn("[next-auth][warn]", code);
    },
    debug(code, metadata) {
      console.debug("[next-auth][debug]", code, metadata);
    }
  },
  pages: {
    signIn: "/login"
  }
};
