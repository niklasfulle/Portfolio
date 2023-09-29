"use client";
import React, { FC } from "react";
import TimelineContainerEdit from "./TimelineContainerEdit";
import TimelineContainerCreate from "./TimelineContainerCreate";
import { ExperienceType } from "@/lib/types";

interface TimelineEditProps {
  data: ExperienceType[];
}

const TimelineEdit: FC<TimelineEditProps> = ({ data }) => {
  let index2 = data.length;
  return (
    <div className="relative mx-auto my-0 mb-10 w-full max-w-7xl px-0 py-[15px] after:absolute after:inset-y-0 after:left-24 after:-ml-px after:w-[.2rem] after:bg-black after:opacity-0 after:content-[''] after:dark:bg-white md:after:left-2/4 md:after:opacity-100">
      <>
        {data.map((item: ExperienceType, index: number) => (
          <React.Fragment key={index}>
            <TimelineContainerEdit
              position={index % 2 === 0 ? "left" : "right"}
              values={{
                id: item.id,
                date: item.date,
                title: item.title,
                location: item.location,
                description: item.description,
                icon: item.icon,
              }}
            />
          </React.Fragment>
        ))}
        <TimelineContainerCreate
          position={index2 % 2 === 0 ? "left" : "right"}
          values={{
            date: "",
            title: "",
            location: "",
            description: "",
            icon: "",
          }}
        />
      </>
    </div>
  );
};

export default TimelineEdit;
