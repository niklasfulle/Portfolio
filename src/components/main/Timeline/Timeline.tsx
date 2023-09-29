"use client";
import React, { FC } from "react";
import TimelineContainer from "./TimelineContainer";
import { ExperienceType } from "@/lib/types";

interface TimelineProps {
  data: ExperienceType[];
}

const Timeline: FC<TimelineProps> = ({ data }) => {
  return (
    <div className="relative mx-auto my-0 w-full max-w-7xl px-0 py-[15px] after:absolute after:inset-y-0 after:left-24 after:-ml-px after:w-[.2rem] after:bg-black after:opacity-0 after:content-[''] after:dark:bg-white md:after:left-2/4 md:after:opacity-100">
      <>
        {data.map((item: ExperienceType, index: number) => (
          <React.Fragment key={index}>
            <TimelineContainer
              position={index % 2 === 0 ? "left" : "right"}
              values={{
                date: item.date,
                title: item.title,
                location: item.location,
                description: item.description,
                icon: item.icon,
              }}
              delay={index * 0.15}
            />
          </React.Fragment>
        ))}
      </>
    </div>
  );
};

export default Timeline;
