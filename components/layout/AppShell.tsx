import Image from "next/image";
import Link from "next/link";
import type { Session } from "next-auth";
import { SignOutButton } from "@/components/auth/SignOutButton";

type AppShellProps = {
  children: React.ReactNode;
  user: Session["user"];
};

export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-slate-950/90 px-6 py-4 backdrop-blur">
        <Link href="/watch" className="text-lg font-semibold text-white">
          BodyVerse
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-200">
            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-slate-800">
              {user?.image ? (
                <Image src={user.image} alt={user?.name ?? "User avatar"} fill sizes="36px" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs text-slate-300">
                  {user?.name?.slice(0, 2)?.toUpperCase() ?? "BV"}
                </span>
              )}
            </div>
            <span>{user?.name ?? "Crew Member"}</span>
          </div>
          <SignOutButton />
        </div>
      </header>
      <div className="flex flex-1 flex-col lg:flex-row">
        <aside className="w-full border-b border-white/10 bg-slate-900/60 px-6 py-6 lg:w-72 lg:border-r lg:border-b-0">
          <nav className="space-y-2 text-sm text-slate-300">
            <Link href="/watch" className="block rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-white">
              Watch sessions
            </Link>
            <Link
              href="/watch/library"
              className="block rounded-xl border border-white/10 px-4 py-3 transition hover:border-white/30 hover:text-white"
            >
              Video library
            </Link>
            <Link
              href="/watch/friends"
              className="block rounded-xl border border-white/10 px-4 py-3 transition hover:border-white/30 hover:text-white"
            >
              Friends
            </Link>
          </nav>
        </aside>
        <main className="flex-1 bg-slate-950 px-6 py-10">{children}</main>
      </div>
    </div>
  );
}
