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
    position === "left"
      ? "md:left-0 "
      : "md:left-1/2 after:-left-2 before:left-2";

  const dateCSS =
    position === "left"
      ? "md:-right-[60%] lg:-right-[50%] xl:-right-[35%] md:text-left"
      : "md:-left-[60%] lg:-left-[50%] xl:-left-[35%] md:text-right";

  const iconCSS =
    position === "left"
      ? "right-0 left-12 md:right-16 md:left-auto"
      : " left-12 md:left-16 md:right-auto";

  const contentCSS =
    position === "left"
      ? "rounded-xl py-8 pl-20 pr-10 md:py-4 lg:py-8 md:pl-4 lg:pl-8 md:pr-24 lg:pr-28"
      : "rounded-xl py-8 pl-20 pr-10 md:py-4 lg:py-8 md:pr-4 lg:pr-8 md:pl-24 lg:pl-28";

  return (
    <motion.div
      className={cn(
        "relative w-full px-8 py-4 before:absolute before:right-2 before:top-[calc(50%_-_1px)] before:z-10 before:h-0.5 before:w-14 before:bg-black before:opacity-0 before:content-[''] after:absolute after:-right-2 after:top-[calc(50%_-_8px)] after:z-10 after:h-4 after:w-4 after:rounded-2xl after:border-[.1rem] after:border-solid after:border-black after:bg-black after:opacity-0 after:content-[''] dark:before:bg-white after:dark:border-white after:dark:bg-white md:w-6/12 md:before:opacity-100 md:after:opacity-100",
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
      <motion.div
        className={cn(
          "absolute bottom-6 right-20 z-10 w-48 text-right text-sm font-bold uppercase tracking-[1px] dark:text-white md:top-[calc(50%_-_8px)] md:inline-block",
          dateCSS
        )}
        initial={{
          opacity: 0,
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
      >
        {values.date}
      </motion.div>
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
          "absolute top-14 z-10 flex h-12 w-12 flex-row items-center justify-center rounded-full border-[.14rem] border-solid border-black  text-center text-lg dark:border-white dark:text-white md:top-[calc(50%_-_24px)]",
          iconCSS
        )}
      >
        {switchIcons(values.icon)}
      </motion.i>
      <motion.div
        className={cn(
          "relative border-[0.14rem] border-black bg-white dark:border-white/30 dark:bg-gray-800 dark:text-white/80 md:py-4 lg:py-8",
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
