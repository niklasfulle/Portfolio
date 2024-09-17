"use client";
import React, { FC, useState } from "react";
import { useSectionInView } from "@/lib/hooks";
import { motion } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import { useSearchParams } from "next/navigation";

interface SkillsProps {
  skills: String[];
  learn: String[];
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

const Skills: FC<SkillsProps> = ({ skills, learn }) => {
  const searchParams = useSearchParams();
  const search = searchParams.get("language");
  const [language, setLanguag] = useState(search ?? "de");
  const { ref } = useSectionInView("Skills");

  return (
    <section
      id="skills"
      ref={ref}
      className="h-fit min-h-screen max-w-[53rem] scroll-mt-28 text-center"
    >
      <SectionHeading>
        {language === "de" ? ("Meine Fähigkeiten" ?? "") : ("My skills" ?? "")}
      </SectionHeading>
      <ul className="mb-16 flex flex-wrap justify-center gap-3 text-lg text-gray-800">
        {skills.map((skill: String, index: number) => (
          <motion.li
            className="rounded-xl border border-black bg-white px-5 py-3 shadow-sm dark:border-white/30 dark:bg-gray-800 dark:text-white/80"
            key={index}
            variants={fadeInAnimationVariants}
            initial="initial"
            whileInView="animate"
            custom={index}
          >
            {skill}
          </motion.li>
        ))}
      </ul>
      <SectionHeading>
        {language === "de"
          ? ("Möchte ich noch lernen" ?? "")
          : ("I want to learn" ?? "")}
      </SectionHeading>
      <ul className="mb-16 flex flex-wrap justify-center gap-3 text-lg text-gray-800">
        {learn.map((learn: String, index: number) => (
          <motion.li
            className="rounded-xl border border-black bg-white px-5 py-3 shadow-sm dark:border-white/30 dark:bg-gray-800 dark:text-white/80"
            key={index}
            variants={fadeInAnimationVariants}
            initial="initial"
            whileInView="animate"
            custom={index}
          >
            {learn}
          </motion.li>
        ))}
      </ul>
    </section>
  );
};

export default Skills;
