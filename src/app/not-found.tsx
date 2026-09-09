"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Compass } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [language, setLanguage] = useState<"de" | "en">("de");
  const isGerman = language === "de";

  useEffect(() => {
    const detectedLanguage = document.documentElement.lang === "en" ? "en" : "de";
    const syncLanguage = window.setTimeout(() => setLanguage(detectedLanguage), 0);
    return () => window.clearTimeout(syncLanguage);
  }, []);

  return (
    <main className="relative flex min-h-[min(42rem,calc(100vh-9rem))] flex-1 items-center justify-center overflow-hidden px-5 py-16 sm:px-8">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/15 blur-3xl dark:bg-violet-500/20"
        animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.8, 0.55] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.section
        aria-labelledby="not-found-title"
        className="relative w-full max-w-2xl rounded-4xl border border-slate-200/70 bg-white/60 p-8 text-center shadow-2xl shadow-slate-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/30 sm:p-14"
        initial={{ opacity: 0, y: 22, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-600 shadow-lg shadow-cyan-500/15 dark:text-cyan-300">
          <Compass aria-hidden="true" className="h-8 w-8" />
        </div>

        <p className="mt-7 bg-linear-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-7xl font-black tracking-[-0.08em] text-transparent sm:text-8xl">
          404
        </p>
        <h1 id="not-found-title" className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {isGerman ? "Diese Seite ist verschwunden." : "This page wandered off."}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
          {isGerman
            ? "Der gesuchte Inhalt wurde nicht gefunden. Vielleicht führt dich ein anderer Weg weiter."
            : "The page you are looking for could not be found. Perhaps another path will take you there."}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            href="/#home"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            {isGerman ? "Zur Startseite" : "Back home"}
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-full border border-slate-300/80 bg-white/50 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-cyan-400 hover:text-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
            href="/#projects"
          >
            {isGerman ? "Projekte ansehen" : "View projects"}
          </Link>
        </div>
      </motion.section>
    </main>
  );
}
