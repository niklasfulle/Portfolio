"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import { Tooltip } from "@mui/material";
import { MapPin, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { FC, useState } from "react";
import IconCarousel from "./IconCarousel";
import { shortToast } from "@/lib/helpers/shorter-function";

interface TimelineContainerCreateProps {
  position: "left" | "right";
  values: {
    date: string;
    title: string;
    location: string;
    description: string;
    icon: string;
  };
}

const TimelineContainerCreate: FC<TimelineContainerCreateProps> = ({
  position,
  values,
}) => {
  const [icon, setIcon] = useState<string>(values.icon);
  const router = useRouter();

  const containterCSS =
    position === "left"
      ? "md:left-0"
      : "md:left-1/2 after:-left-2 before:left-2";
  const dateCSS =
    position === "left"
      ? "md:-right-[60%] lg:-right-[50%] xl:-right-[35%] md:text-left"
      : "md:-left-[60%] lg:-left-[50%] xl:-left-[35%] md:text-right";
  const contentCSS =
    position === "left"
      ? "rounded-xl py-8 pl-20 pr-10 md:py-4 lg:py-8 md:pl-4 lg:pl-8 md:pr-24 lg:pr-28"
      : "rounded-xl py-8 pl-20 pr-10 md:py-4 lg:py-8 md:pr-4 lg:pr-8 md:pl-24 lg:pl-28";

  const createExperience = async (e: any, icon: string) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      date: { value: string };
      title: { value: string };
      location: { value: string };
      description: { value: string };
    };

    const date = target.date.value;
    const title = target.title.value;
    const location = target.location.value;
    const description = target.description.value;

    const data = {
      date,
      title,
      location,
      description,
      icon,
    };

    const res = await fetch("/api/data/experience", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res.ok) {
      shortToast(
        "Success",
        "The Experience was created successfully.",
        "success",
        5000
      );
      router.refresh();
    }
    router.refresh();
  };

  return (
    <div
      className={cn(
        "relative w-full px-8 py-4 before:absolute before:right-2 before:top-[calc(50%_-_1px)] before:z-10 before:h-0.5 before:w-14 before:bg-black before:opacity-0 before:content-[''] after:absolute after:-right-2 after:top-[calc(50%_-_8px)] after:z-10 after:h-4 after:w-4 after:rounded-2xl after:border-[.1rem] after:border-solid after:border-black after:bg-black after:opacity-0 after:content-[''] dark:before:bg-white after:dark:border-white after:dark:bg-white md:w-6/12 md:before:opacity-100 md:after:opacity-100",
        containterCSS
      )}
    >
      <form onSubmit={(e) => createExperience(e, icon)}>
        <div
          className={cn(
            "absolute right-20 top-[calc(50%_-_18px)] z-10 flex w-48 flex-row text-right text-sm font-bold uppercase tracking-[1px] dark:text-white md:inline-block",
            dateCSS
          )}
        >
          <Input
            className="dark:text-white"
            id="date"
            placeholder="Date"
            defaultValue={values.date}
            required
          />
        </div>
        <IconCarousel position={position} icon={icon} setIcon={setIcon} />
        <div
          className={cn(
            "relative border-[0.14rem] border-black bg-white dark:border-white/30 dark:bg-gray-800 dark:text-white/80 md:py-4 lg:py-8",
            contentCSS
          )}
        >
          <h2 className="mx-0 -mt-2 mb-2.5 text-left text-lg dark:text-white">
            <Input
              className="w-72 dark:text-white"
              placeholder="Title"
              id="title"
              defaultValue={values.title}
              required
            />
          </h2>
          <h4 className="mx-0 mb-2.5 mt-0 flex flex-row items-center gap-x-1 text-left text-base dark:text-white ">
            <MapPin className="h-4 w-4" />
            <Input
              className="w-52 dark:text-white"
              placeholder="Location"
              id="location"
              defaultValue={values.location}
              required
            />
          </h4>
          <p className="m-0 text-left text-base leading-5 dark:text-white">
            <Textarea
              className="h-24 w-full dark:text-white"
              placeholder="Description"
              id="description"
              defaultValue={values.description}
              required
            />
          </p>
        </div>

        <Tooltip title="Save" placement="right">
          <Button className="absolute bottom-0 right-4 z-10 h-8 w-8 rounded-lg bg-gray-300 p-1 shadow-md transition-all ease-in hover:cursor-pointer hover:bg-red-300 dark:bg-gray-950 dark:text-white hover:dark:bg-green-700">
            <Save />
          </Button>
        </Tooltip>
      </form>
    </div>
  );
};

export default TimelineContainerCreate;
