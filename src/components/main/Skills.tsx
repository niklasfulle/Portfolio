"use client";
import React, { FC } from "react";
import { useSectionInView } from "@/lib/hooks";
import { motion, useReducedMotion } from "framer-motion";
import { Cloud, Code2, ShieldCheck, TestTube2 } from "lucide-react";
import type { ComponentType } from "react";
import {
  SiBlazor,
  SiCmake,
  SiCplusplus,
  SiCss,
  SiDocker,
  SiDotnet,
  SiFramer,
  SiGit,
  SiGithub,
  SiGitlab,
  SiHtml5,
  SiJavascript,
  SiJest,
  SiMicropython,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPrisma,
  SiPython,
  SiReact,
  SiSonarqubeserver,
  SiSqlite,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";
import SectionHeading from "@/components/SectionHeading";
import { useLanguage } from "@/context/language-context";
import { LanguagesCard } from "./GithubStats";
import type { GithubStatsData } from "@/lib/github-stats";

interface SkillsProps {
  skills: string[];
  stats: GithubStatsData;
}

type SkillIcon = ComponentType<{ className?: string }>;

const skillDetails: Record<
  string,
  { descriptionDe: string; descriptionEn: string; icon: SkillIcon }
> = {
  HTML: { descriptionDe: "Struktur von Webseiten", descriptionEn: "Structure of web pages", icon: SiHtml5 },
  CSS: { descriptionDe: "Layout und visuelles Design", descriptionEn: "Layout and visual design", icon: SiCss },
  JavaScript: { descriptionDe: "Dynamische Webanwendungen", descriptionEn: "Dynamic web applications", icon: SiJavascript },
  TypeScript: { descriptionDe: "Typsichere JavaScript-Entwicklung", descriptionEn: "Type-safe JavaScript development", icon: SiTypescript },
  React: { descriptionDe: "Komponentenbasierte Benutzeroberflächen", descriptionEn: "Component-based user interfaces", icon: SiReact },
  "Next.js": { descriptionDe: "Full-Stack-Framework für React", descriptionEn: "Full-stack framework for React", icon: SiNextdotjs },
  "Tailwind CSS": { descriptionDe: "Utility-first CSS-Framework", descriptionEn: "Utility-first CSS framework", icon: SiTailwindcss },
  "Framer Motion": { descriptionDe: "Animationen für React", descriptionEn: "Animation library for React", icon: SiFramer },
  "Node.js": { descriptionDe: "JavaScript-Laufzeitumgebung auf dem Server", descriptionEn: "Server-side JavaScript runtime", icon: SiNodedotjs },
  Prisma: { descriptionDe: "Typsicherer Datenbankzugriff", descriptionEn: "Type-safe database access", icon: SiPrisma },
  PostgreSQL: { descriptionDe: "Relationale Open-Source-Datenbank", descriptionEn: "Open-source relational database", icon: SiPostgresql },
  SQLite: { descriptionDe: "Leichte eingebettete SQL-Datenbank", descriptionEn: "Lightweight embedded SQL database", icon: SiSqlite },
  Docker: { descriptionDe: "Containerisierung und reproduzierbare Umgebungen", descriptionEn: "Containerization and reproducible environments", icon: SiDocker },
  Git: { descriptionDe: "Versionsverwaltung für Quellcode", descriptionEn: "Version control for source code", icon: SiGit },
  GitHub: { descriptionDe: "Code-Hosting und Zusammenarbeit", descriptionEn: "Code hosting and collaboration", icon: SiGithub },
  "GitLab CI/CD": { descriptionDe: "Automatisierte Build- und Deployment-Pipelines", descriptionEn: "Automated build and deployment pipelines", icon: SiGitlab },
  PowerShell: { descriptionDe: "Automatisierung und Systemverwaltung", descriptionEn: "Automation and system administration", icon: Code2 },
  Python: { descriptionDe: "Skripte, Automatisierung und Backend-Entwicklung", descriptionEn: "Scripting, automation and backend development", icon: SiPython },
  Jest: { descriptionDe: "Unit- und Integrationstests", descriptionEn: "Unit and integration testing", icon: SiJest },
  Playwright: { descriptionDe: "End-to-End-Tests im Browser", descriptionEn: "End-to-end browser testing", icon: TestTube2 },
  SonarQube: { descriptionDe: "Codequalität und Sicherheitsanalyse", descriptionEn: "Code quality and security analysis", icon: SiSonarqubeserver },
  ".NET": { descriptionDe: "Microsoft-Plattform für Softwareentwicklung", descriptionEn: "Microsoft platform for software development", icon: SiDotnet },
  ".NET MAUI": { descriptionDe: "Native Apps mit .NET", descriptionEn: "Native apps with .NET", icon: SiDotnet },
  Blazor: { descriptionDe: "Web-UIs mit .NET und C#", descriptionEn: "Web UIs with .NET and C#", icon: SiBlazor },
  "C++": { descriptionDe: "Performante hardwarenahe Software", descriptionEn: "High-performance low-level software", icon: SiCplusplus },
  CMake: { descriptionDe: "Build-System für C/C++", descriptionEn: "Build system for C/C++", icon: SiCmake },
  MicroPython: { descriptionDe: "Python für Mikrocontroller", descriptionEn: "Python for microcontrollers", icon: SiMicropython },
  Azure: { descriptionDe: "Cloud- und Infrastrukturplattform", descriptionEn: "Cloud and infrastructure platform", icon: Cloud },
  Intune: { descriptionDe: "Geräte- und Endpoint-Verwaltung", descriptionEn: "Device and endpoint management", icon: ShieldCheck },
};

const skillCloudVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

const skillPillVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 360, damping: 22 },
  },
};

type SkillPillProps = {
  readonly skill: string;
  readonly language: "de" | "en";
  readonly shouldReduceMotion: boolean | null;
};

const SkillPill: FC<SkillPillProps> = ({
  skill,
  language,
  shouldReduceMotion,
}) => {
  const details = skillDetails[skill] ?? {
    descriptionDe: "Technologie im persönlichen Stack",
    descriptionEn: "Technology in the personal stack",
    icon: Code2,
  };
  const SkillIconComponent = details.icon;

  return (
    <motion.li
      className="group relative rounded-xl border border-slate-300/80 bg-white/80 px-5 py-3 shadow-sm transition-colors dark:border-white/20 dark:bg-slate-800/75 dark:text-white/85"
      variants={skillPillVariants}
      whileHover={shouldReduceMotion ? undefined : { y: -5, rotate: -1.5, scale: 1.04 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      title={language === "de" ? details.descriptionDe : details.descriptionEn}
    >
      <span className="absolute inset-0 -z-10 rounded-xl bg-cyan-400/0 blur-md transition-colors duration-300 group-hover:bg-cyan-400/20 dark:group-hover:bg-cyan-400/15" />
      <span className="flex items-center gap-2">
        <SkillIconComponent aria-hidden="true" className="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-300" />
        <span>{skill}</span>
      </span>
      <span className="pointer-events-none absolute bottom-[calc(100%+0.6rem)] left-1/2 z-30 w-max max-w-56 -translate-x-1/2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
        {language === "de" ? details.descriptionDe : details.descriptionEn}
      </span>
    </motion.li>
  );
};

const Skills: FC<SkillsProps> = ({ skills, stats }) => {
  const { language } = useLanguage();
  const { ref } = useSectionInView("Skills");
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="skills"
      ref={ref}
      className="h-fit min-h-screen w-full max-w-[64rem] scroll-mt-28 text-center"
    >
      <SectionHeading
        eyebrow={language === "de" ? "Technologie-Stack" : "Technology stack"}
      >
        {language === "de" ? "Meine Fähigkeiten" : "My skills"}
      </SectionHeading>
      <div className="relative rounded-[2rem] border border-slate-200/80 bg-white/45 px-5 py-8 shadow-[0_20px_70px_-35px_rgba(8,145,178,0.45)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/25 dark:shadow-[0_20px_70px_-35px_rgba(34,211,238,0.3)] sm:px-10">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 top-4 h-40 w-40 rounded-full bg-cyan-300/25 blur-3xl dark:bg-cyan-400/15"
          animate={shouldReduceMotion ? undefined : { x: [0, 35, 0], y: [0, 18, 0] }}
          transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 bottom-0 h-44 w-44 rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-500/15"
          animate={shouldReduceMotion ? undefined : { x: [0, -28, 0], y: [0, -20, 0] }}
          transition={{ duration: 11, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.ul
          className="relative z-10 flex flex-wrap justify-center gap-3 text-lg text-gray-800"
          variants={skillCloudVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          {skills.map((skill: string) => (
            <SkillPill
              key={skill}
              language={language}
              shouldReduceMotion={shouldReduceMotion}
              skill={skill}
            />
          ))}
        </motion.ul>
      </div>

      <motion.div
        aria-hidden="true"
        className="relative mx-auto h-12 w-24"
        initial={shouldReduceMotion ? false : { opacity: 0, scaleY: 0 }}
        whileInView={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.8 }}
      >
        <span className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
        <motion.span
          className="absolute left-1/2 top-0 h-full w-px origin-top -translate-x-1/2 bg-gradient-to-b from-cyan-400/80 via-cyan-400/40 to-transparent"
          animate={shouldReduceMotion ? undefined : { opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.span
          className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_18px_5px_rgba(34,211,238,0.35)]"
          animate={shouldReduceMotion ? undefined : { scale: [0.8, 1.25, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
        />
      </motion.div>

      <motion.div
        className="mb-16 w-full text-left"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.15 }}
      >
        <LanguagesCard language={language} stats={stats} />
      </motion.div>
    </section>
  );
};

export default Skills;
