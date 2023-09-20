"use client";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import React, { FC } from "react";
import { CgWorkAlt } from "react-icons/cg";
import { FaReact } from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";
import { motion } from "framer-motion";

interface TimelineContainerProps {
  position: "left" | "right";
  values: {
    date: string;
    title: string;
    location: string;
    description: string;
    icon: string;
  };
  delay: number;
}

const switchIcons = (icon: string) => {
  switch (icon) {
    case "FaReact":
      return <FaReact className="h-7 w-7" />;
    case "CgWorkAlt":
      return <CgWorkAlt className="h-7 w-7" />;
    case "LuGraduationCap":
      return <LuGraduationCap className="h-7 w-7" />;
    default:
      return <FaReact className="h-7 w-7" />;
  }
};

const TimelineContainer: FC<TimelineContainerProps> = ({
  position,
  values,
  delay,
}) => {
  const containterCSS =
    position === "left" ? "left-0" : "left-1/2 after:-left-2 before:left-2";

  const dateCSS =
    position === "left" ? "-right-[40%] text-left" : "-left-[40%] text-right";

  const iconCSS = position === "left" ? "right-16" : "left-16";

  const contentCSS =
    position === "left"
      ? "rounded-r-full rounded-l-md pl-14 pr-28"
      : "rounded-l-full rounded-r-md pl-28 pr-14";

  return (
    <motion.div
      className={cn(
        "relative w-6/12 px-[30px] py-[15px] before:absolute before:right-2 before:top-[calc(50%_-_1px)] before:z-[1] before:h-0.5 before:w-[50px] before:bg-black before:content-[''] after:absolute after:-right-2 after:top-[calc(50%_-_8px)] after:z-[1] after:h-4 after:w-4 after:rounded-2xl after:border-[.2rem] after:border-solid after:border-black after:bg-black after:content-[''] dark:before:bg-white after:dark:border-white after:dark:bg-white",
        containterCSS
      )}
      initial={{
        opacity: 0,
      }}
      whileInView={{
        opacity: 1,
      }}
      transition={{
        duration: 1,
        delay: delay,
      }}
      viewport={{
        once: true,
      }}
    >
      <div
        className={cn(
          "absolute top-[calc(50%_-_8px)] z-[1] inline-block w-48 text-center text-sm font-bold uppercase tracking-[1px]  dark:text-white",
          dateCSS
        )}
      >
        {values.date}
      </div>
      <motion.i
        initial={{
          opacity: 1,
          x: position === "left" ? -150 : 150,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          duration: 1,
          delay: delay,
        }}
        viewport={{
          once: true,
        }}
        className={cn(
          "absolute top-[calc(50%_-_20px)] z-10 flex h-12 w-12 flex-row items-center justify-center rounded-full border-[.14rem] border-solid  border-black text-center text-lg dark:border-white dark:text-white",
          iconCSS
        )}
      >
        {switchIcons(values.icon)}
      </motion.i>
      <motion.div
        className={cn(
          "relative border-[0.14rem] border-black bg-white py-8 dark:border-white/30 dark:bg-gray-800 dark:text-white/80",
          contentCSS
        )}
        initial={{
          opacity: 1,
          x: position === "left" ? -150 : 150,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        transition={{
          duration: 1,
          delay: delay,
        }}
        viewport={{
          once: true,
        }}
      >
        <h2 className="mb-.5 mx-0 mt-0 text-lg dark:text-white">
          {values.title}
        </h2>
        <h4 className="mx-0 mb-2.5 mt-0 flex flex-row items-center gap-x-1 text-base dark:text-white ">
          <MapPin className="h-4 w-4" />
          {values.location}
        </h4>
        <p className="m-0 text-base leading-5 dark:text-white">
          {values.description}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default TimelineContainer;
