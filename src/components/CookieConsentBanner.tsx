"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Cookie } from "lucide-react";
import { useCookieConsent } from "@/context/cookie-consent-context";
import { useLanguage } from "@/context/language-context";

export default function CookieConsentBanner() {
  const { isBannerOpen, saveChoice } = useCookieConsent();
  const { language } = useLanguage();
  const reducedMotion = useReducedMotion();
  const isGerman = language === "de";

  if (!isBannerOpen) {
    return null;
  }

  return (
    <motion.aside
      aria-describedby="cookie-consent-description"
      aria-labelledby="cookie-consent-title"
      aria-modal="true"
      className="fixed inset-x-4 bottom-4 z-[70] mx-auto w-auto max-w-xl rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 sm:bottom-6 sm:p-6"
      initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reducedMotion ? undefined : { opacity: 0, y: 16 }}
      role="dialog"
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex items-start gap-4">
        <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-300">
          <Cookie className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-bold text-slate-950 dark:text-white" id="cookie-consent-title">
            {isGerman ? "Deine Darstellung, deine Entscheidung" : "Your display, your choice"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300" id="cookie-consent-description">
            {isGerman
              ? "Wir verwenden keine Analyse- oder Marketingdienste. Mit deiner Zustimmung speichern wir nur deine Hell-/Dunkelmodus-Präferenz. Deine Auswahl wird für 180 Tage gespeichert."
              : "We do not use analytics or marketing services. With your consent, we only save your light or dark mode preference. Your choice is stored for 180 days."}
          </p>
          <Link className="mt-3 inline-block text-sm font-medium text-cyan-700 underline decoration-cyan-500/40 underline-offset-4 hover:text-cyan-500 dark:text-cyan-300 dark:hover:text-cyan-200" href="/cookies">
            {isGerman ? "Cookie-Richtlinie lesen" : "Read the cookie policy"}
          </Link>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          className="rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 dark:border-white/20 dark:text-slate-100 dark:hover:bg-white/10 dark:focus-visible:ring-offset-slate-950"
          onClick={() => saveChoice("rejected")}
          type="button"
        >
          {isGerman ? "Ablehnen" : "Reject"}
        </button>
        <button
          className="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/25 transition-colors hover:bg-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
          onClick={() => saveChoice("accepted")}
          type="button"
        >
          {isGerman ? "Akzeptieren" : "Accept"}
        </button>
      </div>
    </motion.aside>
  );
}
