"use client";

import { signOut } from "next-auth/react";
import { useTransition } from "react";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(() =>
          signOut({
            callbackUrl: "/"
          })
        )
      }
      className="rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-slate-200 transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isPending}
    >
      {isPending ? "Signing out…" : "Sign out"}
    </button>
  );
}
