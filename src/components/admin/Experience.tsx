"use client";

import React, { FC, useEffect, useState } from "react";
import { useSectionInView } from "@/lib/hooks";
import { useTheme } from "next-themes";
import SectionHeading from "../SectionHeading";
import { Button } from "../ui/Button";
import Timeline from "./Timeline/Timeline";
import TimelineEdit from "./Timeline/TimelineEdit";

interface Props {
  experience?: any;
}

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

      {edit && <TimelineEdit data={experience} />}
      {!edit && <Timeline data={experience} />}
    </section>
  );
};

export default Experience;
