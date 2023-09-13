"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
  /* @ts-ignore */
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { useSectionInView } from "@/lib/hooks";
import { useTheme } from "next-themes";
import { CgWorkAlt } from "react-icons/cg";
import { FaReact } from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";
import SectionHeading from "@/components/SectionHeading";

interface Props {
  experience?: any;
}

const switchIcons = (icon: string) => {
  switch (icon) {
    case "FaReact":
      return <FaReact />;
    case "CgWorkAlt":
      return <CgWorkAlt />;
    case "LuGraduationCap":
      return <LuGraduationCap />;
    default:
      return <FaReact />;
  }
};

const Experience: FC<Props> = ({ experience }) => {
  const { ref } = useSectionInView("Experience");
  const [prefersDarkMode, setPrefersDarkMode] = useState<boolean>(false);

  let { theme } = useTheme();

  useEffect(() => {
    if (localStorage.getItem("theme") === "system") {
      setPrefersDarkMode(true);
    } else {
      setPrefersDarkMode(
        localStorage.getItem("theme") === "dark" ? true : false
      );
    }
  }, [theme]);

  theme = prefersDarkMode ? "dark" : "light";

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
        {experience.map((item: any, index: any) => (
          <React.Fragment key={index}>
            <VerticalTimelineElement
              contentStyle={{
                background: theme === "light" ? "white" : "rgb(31, 41, 55)",
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
              icon={switchIcons(item.icon)}
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
};

export default Experience;
