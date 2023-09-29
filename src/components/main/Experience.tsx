"use client";
import React, { FC } from "react";
import SectionHeading from "@/components/SectionHeading";

import Timeline from "./Timeline/Timeline";
import { ExperienceType } from "@/lib/types";

interface ExperienceProps {
  experience: ExperienceType[];
}

const Experience: FC<ExperienceProps> = ({ experience }) => {
  //const { ref } = useSectionInView("Experience", 0.5);

  return (
    <section
      id="experience"
      //ref={ref}
      className="relative h-fit min-h-screen scroll-mt-28 pb-36"
    >
      <SectionHeading>My experience</SectionHeading>
      <div>
        <Timeline data={experience} />
      </div>
    </section>
  );
};

export default Experience;
