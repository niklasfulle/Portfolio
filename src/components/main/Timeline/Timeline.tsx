"use client";
import { FC } from "react";
import TimelineContainer from "./TimelineContainer";
import { ExperienceType } from "@/lib/types";

interface TimelineProps {
  data: ExperienceType[];
  language: string;
}

const Timeline: FC<TimelineProps> = ({ data, language }) => {
  return (
    <div className="relative mx-auto my-0 w-full max-w-7xl px-0 py-[15px] after:absolute after:inset-y-0 after:left-24 after:-ml-px after:w-[.2rem] after:bg-black after:opacity-0 after:content-[''] after:dark:bg-white md:after:left-2/4 md:after:opacity-100">
      {data.map((item: ExperienceType, index: number) => (
        <TimelineContainer
              key={item.id}
              position={index % 2 === 0 ? "left" : "right"}
              values={{
                date: item.date,
                title:
                  language === "de"
                    ? (item.titleDe ?? "")
                    : (item.titleEn ?? ""),

                location: item.location,
                description:
                  language === "de"
                    ? (item.descriptionDe ?? "")
                    : (item.descriptionEn ?? ""),
                icon: item.icon,
              }}
              delay={index * 0.15}
        />
      ))}
    </div>
  );
};

export default Timeline;
