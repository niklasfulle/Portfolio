"use client";

import Link from "next/link";
import { useLanguage } from "@/context/language-context";
import packageJson from "../../../package.json";

const entries = {
  de: [
    {
      version: "1.0.0",
      date: "20. September 2026",
      title: "Erste öffentliche Portfolio-Version",
      changes: [
        "Mehrsprachige Portfolio-Oberfläche mit Deutsch und Englisch",
        "Projektübersicht mit GitHub-Repository-Informationen und Vorschauen",
        "GitHub-Aktivitäten, Sprachstatistiken und authentifizierte Datenabfragen",
        "Bereiche für Fähigkeiten, Erfahrung, Ausbildung und Kontakt",
        "Cookie-Einstellungen, Datenschutz- und rechtliche Informationsseiten",
      ],
    },
  ],
  en: [
    {
      version: "1.0.0",
      date: "September 20, 2026",
      title: "First public portfolio release",
      changes: [
        "Multilingual portfolio interface in German and English",
        "Project overview with GitHub repository information and previews",
        "GitHub activity, language statistics and authenticated data requests",
        "Sections for skills, experience, education and contact",
        "Cookie preferences, privacy and legal information pages",
      ],
    },
  ],
} as const;

export default function ChangelogPage() {
  const { language } = useLanguage();
  const isGerman = language === "de";
  const copy = isGerman
    ? {
        eyebrow: "Release-Historie",
        title: "Changelog",
        intro: "Alle wichtigen Änderungen am Portfolio übersichtlich ab Version 1.0.",
        current: "Aktuelle Code-Version",
        back: "Zur Startseite",
      }
    : {
        eyebrow: "Release history",
        title: "Changelog",
        intro: "A concise history of the important portfolio changes starting with version 1.0.",
        current: "Current code version",
        back: "Back home",
      };

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <article className="rounded-[2rem] border border-slate-200/80 bg-white/65 p-6 shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-black/25 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-300">
              {copy.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
              {copy.intro}
            </p>
          </div>
          <span className="rounded-full border border-cyan-400/30 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
            {copy.current}: {packageJson.version}
          </span>
        </div>

        <div className="mt-10 space-y-6">
          {entries[language].map((entry) => (
            <section
              className="rounded-2xl border border-slate-200/80 bg-white/45 p-5 dark:border-white/10 dark:bg-slate-900/35 sm:p-6"
              key={entry.version}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200/80 pb-4 dark:border-white/10">
                <div>
                  <p className="text-xl font-bold text-slate-950 dark:text-white">
                    v{entry.version}
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-cyan-700 dark:text-cyan-300">
                    {entry.title}
                  </h2>
                </div>
                <time className="text-sm text-slate-500 dark:text-slate-400">
                  {entry.date}
                </time>
              </div>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {entry.changes.map((change) => (
                  <li className="flex gap-3" key={change}>
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <Link
          className="mt-10 inline-flex rounded-full border border-slate-300/80 bg-white/50 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-cyan-400 hover:text-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
          href="/#home"
        >
          {copy.back}
        </Link>
      </article>
    </main>
  );
}
