"use client";
import React, { FC } from "react";
import "react-vertical-timeline-component/style.min.css";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "@/components/SectionHeading";
import { motion } from "framer-motion";
import Timeline from "./Timeline/Timeline";

type Experience = {
  id: string;
  date: string;
  title: string;
  location: string;
  description: string;
  icon: string;
  series: number;
};

interface Props {
  experience: Experience[];
}

const Experience: FC<Props> = ({ experience }) => {
  const { ref } = useSectionInView("Experience", 0.5);

  return (
    <section
      id="experience"
      ref={ref}
      className="relative h-fit min-h-screen scroll-mt-28 pb-36"
    >
      <div className="absolute left-1/2 top-[7rem] -z-10 h-[41.25rem] w-[11.25rem] translate-x-[50%] rounded-full bg-[#39d1ff] blur-[16rem] dark:bg-[#ff9a60] sm:w-[68.75rem]"></div>
      <div className="absolute right-1/2 top-[13rem] -z-20 h-[41.25rem] w-[11.25rem] translate-x-[-50%] rounded-full bg-[#965eff] blur-[16rem] dark:bg-[#654c81] sm:w-[68.75rem]"></div>

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
