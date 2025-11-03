"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const featureItems = [
  {
    title: "Party watch rooms",
    description: "Spin up synced rooms with Discord friends in seconds."
  },
  {
    title: "3D avatars react",
    description: "Ready Player Me avatars mirror live reactions and emoji."
  },
  {
    title: "Curated one-minute clips",
    description: "Keep energy high with smart playlists of funny or heartfelt videos."
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-20">
        <header className="glass-panel p-10 text-center shadow-2xl">
          <span className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-wider text-slate-200">
            Private beta
          </span>
          <h1 className="text-4xl font-semibold sm:text-6xl">
            Laugh, cry, repeat — together in the BodyVerse.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            Host instant sessions where your crew hangs out as interactive avatars while watching one-minute clips synced in the browser.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="rounded-full bg-brand-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-brand-500/40 transition hover:bg-brand-400"
            >
              Sign in with Discord
            </Link>
            <Link
              href="#roadmap"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-white/40"
            >
              View roadmap
            </Link>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3" id="roadmap">
          {featureItems.map((item) => (
            <motion.article
              key={item.title}
              className="glass-panel p-6"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-300">{item.description}</p>
            </motion.article>
          ))}
        </section>

        <section className="glass-panel grid gap-8 p-10 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Session architecture</h2>
            <p className="text-sm text-slate-300">
              The Next.js frontend orchestrates Discord-authenticated watch parties. Supabase stores playlists and session state, with LiveKit handling realtime voice and spatial presence later on.
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• Server actions curate your video queue and persist state.</li>
              <li>• Realtime channels broadcast play/pause and reaction events.</li>
              <li>• Clients hydrate 3D avatar widgets via Ready Player Me web SDK.</li>
            </ul>
          </div>
          <div className="grid gap-4 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
              <h3 className="font-medium text-white">Tech stack</h3>
              <p className="mt-2 text-slate-300">
                Next.js 15 · Tailwind CSS · NextAuth · Supabase · Ready Player Me · LiveKit
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
              <h3 className="font-medium text-white">Status</h3>
              <p className="mt-2 text-slate-300">Scaffolding in progress — jump into the dashboard once login is wired.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
