"use client";

import { signIn } from "next-auth/react";
import { useTransition } from "react";

export function DiscordSignInButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(() =>
          signIn("discord", {
            callbackUrl: "/watch"
          })
        )
      }
      className="flex items-center justify-center gap-3 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/40 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-75"
      disabled={isPending}
    >
      <span className="text-lg">🌀</span>
      {isPending ? "Opening Discord…" : "Continue with Discord"}
    </button>
  );
}
