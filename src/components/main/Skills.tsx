"use client";
import React, { FC } from "react";
import { useSectionInView } from "@/lib/hooks";
import { motion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import { useLanguage } from "@/context/language-context";
import { LanguagesCard } from "./GithubStats";
import type { GithubStatsData } from "@/lib/github-stats";

interface SkillsProps {
  skills: string[];
  learn: string[];
  stats: GithubStatsData;
}

const fadeInAnimationVariants = {
  initial: {
    opacity: 0,
  },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 * index,
    },
  }),
};

const Skills: FC<SkillsProps> = ({ skills, learn, stats }) => {
  const { language } = useLanguage();
  const { ref } = useSectionInView("Skills");

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
      <ul className="mb-16 flex flex-wrap justify-center gap-3 text-lg text-gray-800">
        {skills.map((skill: string, index: number) => (
          <motion.li
            className="rounded-xl border border-black bg-white px-5 py-3 shadow-sm dark:border-white/30 dark:bg-gray-800 dark:text-white/80"
            key={skill}
            variants={fadeInAnimationVariants}
            initial="initial"
            whileInView="animate"
            custom={index}
          >
            {skill}
          </motion.li>
        ))}
      </ul>
      <div className="mb-16 w-full text-left">
        <LanguagesCard language={language} stats={stats} />
      </div>
      <SectionHeading
        eyebrow={language === "de" ? "Als Nächstes" : "Next up"}
      >
        {language === "de"
          ? "Möchte ich noch lernen"
          : "I want to learn"}
      </SectionHeading>
      <ul className="mb-16 flex flex-wrap justify-center gap-3 text-lg text-gray-800">
        {learn.map((learnItem: string, index: number) => (
          <motion.li
            className="rounded-xl border border-black bg-white px-5 py-3 shadow-sm dark:border-white/30 dark:bg-gray-800 dark:text-white/80"
            key={learnItem}
            variants={fadeInAnimationVariants}
            initial="initial"
            whileInView="animate"
            custom={index}
          >
            {learnItem}
          </motion.li>
        ))}
      </ul>
    </section>
  );
};

export default Skills;
