"use client";

import { CalendarDays, MapPin } from "lucide-react";
import { FC } from "react";
import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import { CgWorkAlt } from "react-icons/cg";
import { LuGraduationCap } from "react-icons/lu";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "@/components/SectionHeading";
import { ExperienceType } from "@/lib/types";
import { useLanguage } from "@/context/language-context";

interface ExperienceProps {
  experience: ExperienceType[];
}

type ExperienceCardProps = {
  item: ExperienceType;
  language: "de" | "en";
};

const organizationLinks = [
  {
    name: "biqx GmbH",
    url: "https://www.linkedin.com/company/biqx-gmbh/",
  },
  {
    name: "Pintsch GmbH",
    url: "https://www.linkedin.com/company/pintsch/",
  },
  {
    name: "Ostfalia",
    url: "https://www.linkedin.com/school/ostfalia---university-of-applied-sciences/",
  },
  {
    name: "Heinrich-Büssing-Schule",
    url: "https://www.linkedin.com/school/heinrich-b%C3%BCssing-schule-braunschweig/",
  },
] as const;

const LinkedLocation: FC<{ location: string }> = ({ location }) => {
  const organization = organizationLinks.find(({ name }) =>
    location.includes(name)
  );

  if (!organization) {
    return <>{location}</>;
  }

  const [before, after] = location.split(organization.name);

  return (
    <>
      {before}
      <a
        href={organization.url}
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-cyan-700 underline decoration-cyan-500/40 underline-offset-2 transition-colors hover:text-cyan-500 dark:text-cyan-300 dark:hover:text-cyan-200"
      >
        {organization.name}
      </a>
      {after}
    </>
  );
};

const ExperienceCard: FC<ExperienceCardProps> = ({ item, language }) => {
  const shouldReduceMotion = useReducedMotion();
  const isEducation = item.category === "education";
  const title = language === "de" ? item.titleDe : item.titleEn;
  const description = language === "de" ? item.descriptionDe : item.descriptionEn;

  return (
    <motion.article
      className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/75 p-5 shadow-sm backdrop-blur-sm transition-colors hover:border-cyan-500/60 hover:bg-white dark:border-white/10 dark:bg-slate-950/55 dark:hover:border-cyan-400/50 dark:hover:bg-slate-900/70"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      viewport={{ once: true, margin: "-60px" }}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-cyan-400 via-blue-500 to-violet-500 opacity-80" />

      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300">
          {isEducation ? (
            <LuGraduationCap aria-hidden="true" className="h-6 w-6" />
          ) : (
            <CgWorkAlt aria-hidden="true" className="h-6 w-6" />
          )}
        </div>
        <p className="flex items-center gap-1.5 text-right text-sm font-medium tabular-nums text-slate-500 dark:text-slate-300">
          <CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span>{item.date}</span>
        </p>
      </div>

      <h4 className="text-lg font-semibold leading-snug text-slate-950 dark:text-white">
        {title}
      </h4>
      <p className="mt-2 flex min-w-0 items-start gap-2 wrap-break-word text-sm font-medium text-slate-600 dark:text-slate-300">
        <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-300" />
        <span>
          <LinkedLocation location={item.location} />
        </span>
      </p>
      <p className="mt-4 min-w-0 wrap-break-word text-sm leading-6 text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </motion.article>
  );
};

type ExperienceGroupProps = {
  id: string;
  title: string;
  items: ExperienceType[];
  language: "de" | "en";
};

const ExperienceGroup: FC<ExperienceGroupProps> = ({
  id,
  title,
  items,
  language,
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby={id}>
      <div className="mb-5 flex items-center gap-4">
        <h3
          id={id}
          className="text-xl font-semibold text-slate-900 dark:text-white"
        >
          {title}
        </h3>
        <div aria-hidden="true" className="h-px flex-1 bg-slate-200 dark:bg-white/15" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <ExperienceCard key={item.id} item={item} language={language} />
        ))}
      </div>
    </section>
  );
};

const Experience: FC<ExperienceProps> = ({ experience }) => {
  const { language } = useLanguage();
  const { ref } = useSectionInView("Experience", 0.2);
  const workExperience = experience.filter(
    (item) => item.category !== "education"
  );
  const education = experience.filter((item) => item.category === "education");

  return (
    <section
      id="experience"
      ref={ref}
      className="section-glow section-glow--experience mb-36 relative h-fit min-h-screen w-full max-w-5xl scroll-mt-28 pb-36"
    >
      <SectionHeading eyebrow={language === "de" ? "Werdegang" : "Career"}>
        {language === "de" ? "Erfahrung & Ausbildung" : "Experience & education"}
      </SectionHeading>
      <div className="space-y-14">
        <ExperienceGroup
          id="work-experience-heading"
          title={language === "de" ? "Berufserfahrung" : "Work experience"}
          items={workExperience}
          language={language}
        />
        <ExperienceGroup
          id="education-heading"
          title={language === "de" ? "Ausbildung" : "Education"}
          items={education}
          language={language}
        />
      </div>
    </section>
  );
};

export default Experience;
