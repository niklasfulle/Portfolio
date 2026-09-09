"use client";

import { FC } from "react";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import { Code2, GitBranch, Layers3 } from "lucide-react";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "@/components/SectionHeading";
import { AbouteMeType } from "@/lib/types";
import { useLanguage } from "@/context/language-context";

interface AboutProps {
  abouteMe: AbouteMeType[];
}

const focusAreas = [
  {
    icon: Code2,
    de: "Softwareentwicklung",
    en: "Software development",
  },
  {
    icon: GitBranch,
    de: "DevOps & CI/CD",
    en: "DevOps & CI/CD",
  },
  {
    icon: Layers3,
    de: "Klare Systemarchitektur",
    en: "Clear system architecture",
  },
] as const;

const About: FC<AboutProps> = ({ abouteMe }) => {
  const { language } = useLanguage();
  const { ref } = useSectionInView("About");
  const reducedMotion = useReducedMotion();
  const isGerman = language === "de";

  return (
    <section
      id="about"
      ref={ref}
      className="section-glow section-glow--about mb-36 h-fit min-h-screen w-full max-w-5xl scroll-mt-28 pb-24"
    >
      <SectionHeading eyebrow={isGerman ? "Profil" : "Profile"}>
        {isGerman ? "Über mich" : "About me"}
      </SectionHeading>

      <motion.div
        className="relative overflow-hidden rounded-4xl border border-slate-200/80 bg-white/45 p-6 shadow-[0_20px_70px_-35px_rgba(8,145,178,0.45)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/30 dark:shadow-[0_20px_70px_-35px_rgba(34,211,238,0.25)] sm:p-10"
        initial={reducedMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-60 w-60 rounded-full bg-cyan-300/15 blur-3xl dark:bg-cyan-400/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-violet-300/15 blur-3xl dark:bg-violet-500/10" />

        <div className="relative grid gap-10 md:grid-cols-[1.35fr_0.65fr] md:gap-14">
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
              {isGerman ? "Kurzprofil" : "Profile"}
            </p>
            <div className="mt-5 space-y-4 text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
              {abouteMe.map((aboutItem) => (
                <motion.p
                  key={aboutItem.id}
                  initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.1 }}
                  viewport={{ once: true, amount: 0.4 }}
                >
                  {isGerman ? aboutItem.textDe ?? "" : aboutItem.textEn ?? ""}
                </motion.p>
              ))}
            </div>
          </div>

          <aside className="text-left md:border-l md:border-slate-200/80 md:pl-8 dark:md:border-white/10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
              {isGerman ? "Schwerpunkte" : "Focus areas"}
            </p>
            <ul className="mt-5 space-y-3">
              {focusAreas.map(({ icon: Icon, de, en }, index) => (
                <motion.li
                  className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white/55 px-3 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-900/45 dark:text-slate-200"
                  initial={reducedMotion ? false : { opacity: 0, x: 14 }}
                  key={de}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.12 + index * 0.08 }}
                  viewport={{ once: true, amount: 0.5 }}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-600 dark:text-cyan-300">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </span>
                  {isGerman ? de : en}
                </motion.li>
              ))}
            </ul>
          </aside>
        </div>
      </motion.div>
    </section>
  );
};

export default About;
