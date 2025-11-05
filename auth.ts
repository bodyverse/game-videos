import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { authOptions } from "@/lib/authOptions";

let initializedAuth: ReturnType<typeof NextAuth>;

try {
  initializedAuth = NextAuth(authOptions as unknown as NextAuthConfig);
} catch (error) {
  console.error("[auth.ts] Failed to initialize NextAuth", error);
  throw error;
}

export const { auth, signIn, signOut, handlers: { GET, POST } } = initializedAuth;
