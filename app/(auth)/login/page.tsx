import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DiscordSignInButton } from "@/components/auth/DiscordSignInButton";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/watch");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-slate-900/80 p-10 shadow-2xl">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-white">Welcome to BodyVerse Watch</h1>
          <p className="text-sm text-slate-300">
            Sign in with Discord to pull your crew list and start a shared watch session.
          </p>
        </div>
        <DiscordSignInButton />
        <p className="text-xs text-slate-500">
          By continuing you agree that we’ll cache your Discord profile and guild memberships to power friend sync.
        </p>
      </div>
    </main>
  );
}
