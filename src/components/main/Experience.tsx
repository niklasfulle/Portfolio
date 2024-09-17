"use client";
import React, { FC, useState } from "react";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "@/components/SectionHeading";
import { motion } from "framer-motion";
import Timeline from "./Timeline/Timeline";
import { ExperienceType } from "@/lib/types";
import { useSearchParams } from "next/navigation";

interface ExperienceProps {
  experience: ExperienceType[];
}

const Experience: FC<ExperienceProps> = ({ experience }) => {
  const searchParams = useSearchParams();
  const search = searchParams.get("language");
  const [language, setLanguag] = useState(search ?? "de");

  const { ref } = useSectionInView("Experience", 0.5);

  return (
    <section
      id="experience"
      ref={ref}
      className="relative h-fit min-h-screen scroll-mt-28 pb-36"
    >
      <SectionHeading>
        {language === "de"
          ? ("Meine Erfahrung" ?? "")
          : ("My experience" ?? "")}
      </SectionHeading>
      <motion.div
        initial={{
          opacity: 0,
        }}
        whileInView={{
          opacity: 1,
        }}
        transition={{
          duration: 1,
        }}
      >
        <Timeline data={experience} language={language} />
      </motion.div>
    </section>
  );
};

export default Experience;
