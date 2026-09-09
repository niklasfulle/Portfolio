"use client";

import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";
import GithubStats from "@/components/main/GithubStats";
import { useActiveSectionContext } from "@/context/active-section-context";
import { useLanguage } from "@/context/language-context";
import { useSectionInView } from "@/lib/hooks";
import type { GithubStatsData } from "@/lib/github-stats";

type IntroProps = {
  readonly stats: GithubStatsData;
};

export default function Intro({ stats }: IntroProps) {
  const { language } = useLanguage();
  const reducedMotion = useReducedMotion();
  const { ref } = useSectionInView("Home", 0.5);
  const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext();

  return (
    <section
      ref={ref}
      id="home"
      className="section-glow section-glow--intro mb-36 h-fit min-h-[calc(100svh-9rem)] w-full max-w-[64rem] scroll-mt-32 pt-4 text-center sm:pt-8"
    >
      <motion.div
        className="relative isolate overflow-hidden rounded-[2rem] border border-white/60 bg-white/35 px-5 py-10 shadow-2xl shadow-slate-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/35 dark:shadow-black/30 sm:px-10 sm:py-14"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.2),transparent_55%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.14),transparent_34%),linear-gradient(135deg,rgba(99,102,241,0.14),transparent_55%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-28 -z-10 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl dark:bg-indigo-500/20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-24 -z-10 h-72 w-72 rounded-full bg-indigo-400/15 blur-3xl dark:bg-fuchsia-500/10"
        />

        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">
          {language === "de" ? "Persönliches Portfolio" : "Personal portfolio"}
        </p>

        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Niklas Fulle
        </h2>

      <div className="mt-8 flex items-center justify-center">
        <div className="relative">
          <motion.div
            aria-hidden="true"
            className="absolute -inset-3 rounded-full bg-gradient-to-br from-cyan-400/30 via-indigo-400/20 to-fuchsia-400/25 blur-xl"
              animate={
                reducedMotion
                  ? undefined
                  : { scale: [0.94, 1.06, 0.94], opacity: [0.65, 0.9, 0.65] }
              }
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="relative rounded-full bg-gradient-to-br from-cyan-300 via-white to-indigo-400 p-1 shadow-xl shadow-cyan-950/15 dark:from-cyan-300 dark:via-slate-100 dark:to-indigo-400"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.55, type: "spring", stiffness: 160 }}
          >
            <Image
              src="https://avatars.githubusercontent.com/u/36989748?s=400&u=bb05585eac7349855b6c5039ea699362e543966b&v=4"
              alt="Niklas Fulle profile picture"
              width="192"
              height="192"
              quality="95"
              priority
              className="h-40 w-40 rounded-full border-4 border-white/90 object-cover shadow-xl sm:h-48 sm:w-48"
            />
          </motion.div>

          <motion.span
            aria-hidden="true"
            className="absolute -bottom-1 -right-2 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-slate-950 text-3xl shadow-lg dark:border-slate-950 dark:bg-white"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.7, stiffness: 125, type: "spring" }}
          >
            👋
          </motion.span>
          </div>
        </div>

      <motion.h1
        className="mx-auto mt-8 max-w-2xl px-2 text-3xl font-medium !leading-[1.15] tracking-tight text-slate-900 dark:text-white sm:text-5xl"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.55, ease: "easeOut" }}
      >
        <span className="font-bold [text-wrap:balance]">
          {language === "de" ? "Hallo, ich bin Niklas." : "Hello, I'm Niklas."}
        </span>
      </motion.h1>

      <motion.p
        className="mx-auto mt-4 max-w-2xl whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }}
      >
        {language === "de"
          ? "Bachelor-Abschluss in Informatik mit Schwerpunkt Softwareentwicklung an der Ostfalia Hochschule für angewandte Wissenschaften in Wolfenbüttel, Deutschland.\nDerzeit arbeite ich als Softwareentwickler."
          : "Bachelor's degree in computer science, specialising in software engineering, from Ostfalia University of Applied Sciences in Wolfenbüttel, Germany.\nI am currently working as a software developer."}
      </motion.p>

      <motion.div
        className="mt-8 flex flex-col items-center justify-center gap-3 px-4 text-base font-semibold sm:flex-row"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5, ease: "easeOut" }}
      >
        <Link
          href="#contact"
          className="group inline-flex items-center gap-3 rounded-full bg-slate-950 px-7 py-3.5 text-white shadow-lg shadow-slate-950/20 outline-none transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:translate-y-0 dark:bg-cyan-400 dark:text-slate-950 dark:shadow-cyan-950/20 dark:hover:bg-cyan-300"
          onClick={() => {
            setActiveSection("Contact");
            setTimeOfLastClick(Date.now());
          }}
        >
          {language === "de" ? "Kontakt aufnehmen" : "Get in touch"}
          <BsArrowRight
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
        <Link
          href="#projects"
          className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/45 px-7 py-3.5 text-slate-800 outline-none transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-cyan-400 hover:bg-white/75 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:translate-y-0 dark:border-slate-700 dark:bg-slate-900/45 dark:text-slate-100 dark:hover:border-cyan-400 dark:hover:bg-slate-900"
        >
          {language === "de" ? "Projekte ansehen" : "View projects"}
        </Link>
      </motion.div>
      </motion.div>

      <GithubStats language={language} stats={stats} />
    </section>
  );
}
