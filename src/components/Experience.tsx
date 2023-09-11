"use client";

import React from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
  /* @ts-ignore */
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { experiencesData } from "@/lib/data";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "./SectionHeading";
import { useTheme } from "next-themes";

export default function Experience() {
  const { ref } = useSectionInView("Experience");
  const { theme } = useTheme();

  return (
    <section
      id="experience"
      ref={ref}
      className="h-fit min-h-screen scroll-mt-28 pb-36"
    >
      <div className="absolute left-1/2 top-[277rem] -z-10 h-[41.25rem] w-[11.25rem] translate-x-[50%] rounded-full bg-[#39d1ff] blur-[16rem] dark:bg-[#ff9a60] sm:w-[68.75rem]"></div>
      <div className="absolute right-1/2 top-[253rem] -z-20 h-[41.25rem] w-[11.25rem] translate-x-[-50%] rounded-full bg-[#965eff] blur-[16rem] dark:bg-[#654c81] sm:w-[68.75rem]"></div>
      <SectionHeading>My experience</SectionHeading>
      <VerticalTimeline lineColor="">
        {experiencesData.map((item, index) => (
          <React.Fragment key={index}>
            <VerticalTimelineElement
              contentStyle={{
                background: theme === "light" ? "#f3f4f6" : "rgb(31, 41, 55)",
                boxShadow: "none",
                border: "2px solid rgba(0, 0, 0, 0.4)",
                textAlign: "left",
                padding: "1.3rem 2rem",
              }}
              contentArrowStyle={{
                borderRight:
                  theme === "light"
                    ? "0.4rem solid #9ca3af"
                    : "0.4rem solid rgb(31, 41, 55)",
              }}
              date={item.date}
              icon={item.icon}
              iconStyle={{
                border: "2px solid rgba(0, 0, 0, 0.4)",
                background: theme === "light" ? "white" : "rgb(31, 41, 55)",
                fontSize: "1.5rem",
              }}
            >
              <h3 className="font-semibold capitalize">{item.title}</h3>
              <p className="!mt-0 font-normal">{item.location}</p>
              <p className="!mt-1 !font-normal text-gray-700 dark:text-white/75">
                {item.description}
              </p>
            </VerticalTimelineElement>
          </React.Fragment>
        ))}
      </VerticalTimeline>
    </section>
  );
}
