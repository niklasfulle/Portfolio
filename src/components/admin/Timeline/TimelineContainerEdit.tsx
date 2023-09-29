"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import { Tooltip } from "@mui/material";
import { MapPin, Pencil, Save, Trash, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { FC, useState } from "react";
import { CgWorkAlt } from "react-icons/cg";
import { FaReact } from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";
import IconCarousel from "./IconCarousel";
import { shortToast } from "@/lib/helpers/shorter-function";
import { ExperienceReducedType } from "@/lib/types";

interface TimelineContainerEditProps {
  position: "left" | "right";
  values: ExperienceReducedType;
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

const TimelineContainerEdit: FC<TimelineContainerEditProps> = ({
  position,
  values,
}) => {
  const [edit, setEdit] = useState<boolean>(false);
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
  const iconCSS =
    position === "left"
      ? "right-0 left-12 md:right-16 md:left-auto"
      : " left-12 md:left-16 md:right-auto";
  const contentCSS =
    position === "left"
      ? "rounded-xl py-8 pl-20 pr-10 md:py-4 lg:py-8 md:pl-4 lg:pl-8 md:pr-24 lg:pr-28"
      : "rounded-xl py-8 pl-20 pr-10 md:py-4 lg:py-8 md:pr-4 lg:pr-8 md:pl-24 lg:pl-28";

  const updateExperience = async (e: any, id: string, icon: string) => {
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
      id: id,
      date: date,
      title: title,
      location: location,
      description: description,
      icon: icon,
    };

    const res = await fetch("/api/data/experience", {
      method: "PUT",
      body: JSON.stringify(data),
    });

    if (res.ok) {
      shortToast(
        "Success",
        "The Experience was updated successfully.",
        "success",
        5000
      );
      router.refresh();
    }
    router.refresh();
  };

  const deleteExperience = async (id: string) => {
    const data = {
      id: id,
    };

    const res = await fetch("/api/data/experience", {
      method: "DELETE",
      body: JSON.stringify(data),
    });

    if (res.ok) {
      shortToast(
        "Success",
        "The Experience was deleted successfully.",
        "success",
        5000
      );
      router.refresh();
    }
  };

  const closeEdit = () => {
    setIcon(values.icon);
    setEdit(false);
  };

  return (
    <>
      {!edit ? (
        <div
          className={cn(
            "relative w-full px-8 py-4 before:absolute before:right-2 before:top-[calc(50%_-_1px)] before:z-10 before:h-0.5 before:w-14 before:bg-black before:opacity-0 before:content-[''] after:absolute after:-right-2 after:top-[calc(50%_-_8px)] after:z-10 after:h-4 after:w-4 after:rounded-2xl after:border-[.1rem] after:border-solid after:border-black after:bg-black after:opacity-0 after:content-[''] dark:before:bg-white after:dark:border-white after:dark:bg-white md:w-6/12 md:before:opacity-100 md:after:opacity-100",
            containterCSS
          )}
        >
          <div
            className={cn(
              "absolute bottom-6 right-20 z-10 w-48 text-right text-sm font-bold uppercase tracking-[1px] dark:text-white md:top-[calc(50%_-_8px)] md:inline-block",
              dateCSS
            )}
          >
            {values.date}
          </div>
          <i
            className={cn(
              "absolute top-14 z-10 flex h-12 w-12 flex-row items-center justify-center rounded-full border-[.14rem] border-solid border-black  text-center text-lg dark:border-white dark:text-white md:top-[calc(50%_-_24px)]",
              iconCSS
            )}
          >
            {switchIcons(icon)}
          </i>
          <div
            className={cn(
              "relative border-[0.14rem] border-black bg-white dark:border-white/30 dark:bg-gray-800 dark:text-white/80 md:py-4 lg:py-8",
              contentCSS
            )}
          >
            <h2 className="mb-.5 mx-0 mt-0 text-left text-lg dark:text-white">
              {values.title}
            </h2>
            <h4 className="mx-0 mb-2.5 mt-0 flex flex-row items-center gap-x-1 text-left text-base dark:text-white ">
              <MapPin className="h-4 w-4" />
              {values.location}
            </h4>
            <p className="m-0 text-left text-base leading-5 dark:text-white">
              {values.description}
            </p>
          </div>
          <Tooltip title="Edit" placement="right">
            <Pencil
              onClick={() => setEdit(true)}
              className="absolute right-4 top-0 z-10 h-8 w-8 rounded-lg bg-gray-300 p-1 shadow-md transition-all ease-in hover:cursor-pointer hover:bg-red-300 dark:bg-gray-950 dark:text-white hover:dark:bg-green-700"
            />
          </Tooltip>
        </div>
      ) : (
        <div
          className={cn(
            "relative w-full px-8 py-4 before:absolute before:right-2 before:top-[calc(50%_-_1px)] before:z-10 before:h-0.5 before:w-14 before:bg-black before:opacity-0 before:content-[''] after:absolute after:-right-2 after:top-[calc(50%_-_8px)] after:z-10 after:h-4 after:w-4 after:rounded-2xl after:border-[.1rem] after:border-solid after:border-black after:bg-black after:opacity-0 after:content-[''] dark:before:bg-white after:dark:border-white after:dark:bg-white md:w-6/12 md:before:opacity-100 md:after:opacity-100",
            containterCSS
          )}
        >
          <form onSubmit={(e) => updateExperience(e, values.id!, icon)}>
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
            <Tooltip title="Edit" placement="right">
              <X
                onClick={() => closeEdit()}
                className="absolute right-4 top-0 z-10 h-8 w-8 rounded-lg bg-gray-300 p-1 shadow-md transition-all ease-in hover:cursor-pointer hover:bg-red-300 dark:bg-gray-950 dark:text-white hover:dark:bg-red-700"
              />
            </Tooltip>
            <Tooltip title="Delete" placement="right">
              <Trash
                onClick={() => deleteExperience(values.id!)}
                className="absolute bottom-[calc(50%_-_15px)] right-4 z-10 h-8 w-8 rounded-lg bg-gray-300 p-1 shadow-md transition-all ease-in hover:cursor-pointer hover:bg-red-300 dark:bg-gray-950 dark:text-white hover:dark:bg-red-700"
              />
            </Tooltip>
            <Tooltip title="Save" placement="right">
              <Button className="absolute bottom-0 right-4 z-10 h-8 w-8 rounded-lg bg-gray-300 p-1 shadow-md transition-all ease-in hover:cursor-pointer hover:bg-red-300 dark:bg-gray-950 dark:text-white hover:dark:bg-green-700">
                <Save />
              </Button>
            </Tooltip>
          </form>
        </div>
      )}
    </>
  );
};

export default TimelineContainerEdit;
