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
import SectionHeading from "../SectionHeading";
import { Button } from "../ui/Button";

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
  const [edit, setEdit] = useState(false);
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
      className="relative flex h-fit min-h-screen w-5/6 scroll-mt-28 flex-col items-center border border-black text-center dark:border-white"
    >
      {!edit && (
        <Button
          className="absolute right-2 top-2 min-w-[6rem] bg-gray-800 font-semibold text-white shadow-md  hover:bg-gray-600 dark:text-black dark:hover:bg-gray-400"
          onClick={() => setEdit(true)}
        >
          Edit
        </Button>
      )}
      {edit && (
        <>
          <Button
            className="absolute right-2 top-2 min-w-[6rem] bg-gray-800 font-semibold text-white shadow-md  hover:bg-gray-600 dark:text-black dark:hover:bg-gray-400"
            onClick={() => setEdit(false)}
          >
            Close
          </Button>
        </>
      )}
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
