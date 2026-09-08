"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useLanguage } from "@/context/language-context";

const footerLinks = [
  { hash: "#home", de: "Startseite", en: "Home" },
  { hash: "#about", de: "Über mich", en: "About" },
  { hash: "#projects", de: "Projekte", en: "Projects" },
  { hash: "#skills", de: "Fähigkeiten", en: "Skills" },
  { hash: "#experience", de: "Erfahrung", en: "Experience" },
  { hash: "#contact", de: "Kontakt", en: "Contact" },
] as const;

export default function Footer() {
  const { language } = useLanguage();
  const reducedMotion = useReducedMotion();
  const year = new Date().getFullYear();
  const isGerman = language === "de";

  return (
    <motion.footer
      className="relative mx-0 mt-10 w-full max-w-none overflow-hidden border-t border-slate-300/70 bg-white/20 px-5 pb-8 pt-12 text-slate-600 dark:border-white/10 dark:bg-slate-950/20 dark:text-slate-300 sm:px-8"
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-cyan-300/15 blur-3xl dark:bg-cyan-400/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-1/4 h-56 w-56 rounded-full bg-violet-300/15 blur-3xl dark:bg-violet-500/10" />

      <div className="relative mx-auto grid w-full max-w-[80rem] gap-10 md:grid-cols-[1.2fr_0.8fr] md:gap-16">
        <div>
          <a className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 dark:text-white" href="#home">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-sm text-white shadow-lg shadow-cyan-500/20 dark:bg-white dark:text-slate-950">N</span>
            Niklas Fulle
          </a>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
            {isGerman
              ? "Softwareentwickler und DevOps-Enthusiast mit Freude an klaren, zuverlässigen Lösungen."
              : "Software developer and DevOps enthusiast who enjoys building clear, reliable solutions."}
          </p>
        </div>

        <nav aria-label={isGerman ? "Footer-Navigation" : "Footer navigation"}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
            {isGerman ? "Schnellzugriff" : "Quick access"}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {footerLinks.map((link) => (
              <a className="group inline-flex items-center gap-1 transition-colors hover:text-cyan-600 dark:hover:text-cyan-300" href={link.hash} key={link.hash}>
                {isGerman ? link.de : link.en}
                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <motion.a aria-label="GitHub" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/60 text-slate-700 transition-colors hover:border-cyan-400 hover:text-cyan-600 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-cyan-400 dark:hover:text-cyan-300" href="https://github.com/niklasfulle" rel="noreferrer" target="_blank" whileHover={reducedMotion ? undefined : { y: -3 }}>
              <FaGithub className="h-5 w-5" />
            </motion.a>
            <motion.a aria-label="LinkedIn" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/60 text-slate-700 transition-colors hover:border-cyan-400 hover:text-cyan-600 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-cyan-400 dark:hover:text-cyan-300" href="https://www.linkedin.com/in/niklas-fulle-61b422232/" rel="noreferrer" target="_blank" whileHover={reducedMotion ? undefined : { y: -3 }}>
              <FaLinkedin className="h-5 w-5" />
            </motion.a>
          </div>
        </nav>
      </div>

      <div className="relative mx-auto mt-10 flex w-full max-w-[80rem] flex-col gap-2 border-t border-slate-200/80 pt-5 text-xs text-slate-500 dark:border-white/10 dark:text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <small>© {year} Niklas Fulle</small>
        <span>{isGerman ? "Mit React, Next.js und viel Sorgfalt gebaut." : "Built with React, Next.js and care."}</span>
      </div>
    </motion.footer>
  );
}
