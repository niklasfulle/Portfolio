"use client";
import React, { FC } from "react";
import "react-vertical-timeline-component/style.min.css";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "@/components/SectionHeading";
import { motion } from "framer-motion";
import Timeline from "./Timeline/Timeline";

type ExperienceType = {
  id: string;
  date: string;
  title: string;
  location: string;
  description: string;
  icon: string;
  series: number;
};

interface Props {
  experience: ExperienceType[];
}

const Experience: FC<Props> = ({ experience }) => {
  const { ref } = useSectionInView("Experience", 0.5);

  return (
    <section
      id="experience"
      ref={ref}
      className="relative h-fit min-h-screen scroll-mt-28 pb-36"
    >
      <SectionHeading>My experience</SectionHeading>
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
        <Timeline data={experience} />
      </motion.div>
    </section>
  );
};

export default Experience;
