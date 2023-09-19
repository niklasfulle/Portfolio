"use client";

import { useRef, useState } from "react";
import FormInput from "../ui/FormInput";
import FormTextarea from "../ui/FormTextarea";
import FormUpload from "../ui/FormUpload";
import { Button } from "../ui/Button";
import { shortToast } from "@/lib/helpers/shorter-function";
import { Trash } from "lucide-react";
import { Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";

type ProjectProps = {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  tags: string;
  series: number;
};

export default function ProjectEdit({
  id,
  title,
  description,
  image,
  url,
  tags,
  series,
}: ProjectProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>(image || "");
  const [file, setFile] = useState<File>();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  const updateProject = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    const target = e.target as typeof e.target & {
      title: { value: string };
      description: { value: string };
      tags: { value: string };
      url: { value: string };
      series: { value: number };
    };

    const title = target.title.value;
    const description = target.description.value;
    const tags = target.tags.value;
    const url = target.url.value;
    const series = target.series.value;

    try {
      if (file) {
        const data = new FormData();
        data.set("file", file);
        data.set("title", title);

        const res1 = await fetch("/api/data/upload", {
          method: "POST",
          body: data,
        });
        // handle the error
        if (!res1.ok) throw new Error(await res1.text());

        const resObject = await res1.json();
        image = resObject.fileName;
      }

      let imageSplit = image.split("/");
      image = `/images/${imageSplit[imageSplit.length - 1]}`;

      const project = {
        id,
        title,
        description,
        tags,
        url,
        image,
        series: Number(series),
      };
      const res2 = await fetch("/api/data/projects", {
        method: "PUT",
        body: JSON.stringify(project),
      });

      if (res2.status === 200) {
        shortToast(
          "Success",
          "The project was updated successfully.",
          "success",
          5000
        );
      }
    } catch (e: any) {
      // Handle errors here
      console.error(e);
    }

    setIsLoading(false);
  };

  const deleteProject = async (id: string) => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/data/projects", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });

      if (res.status === 200) {
        shortToast(
          "Success",
          "The project was deleted successfully.",
          "success",
          5000
        );
        router.refresh();
      }
    } catch (e: any) {}

    setIsLoading(false);
  };

  return (
    <div
      ref={ref}
      className="group relative mb-3 rounded-lg bg-gray-100 shadow-lg last:mb-0 dark:bg-gray-800 sm:mb-8"
    >
      <Tooltip title="Delete" placement="right">
        <Trash
          onClick={() => deleteProject(id)}
          className="absolute -right-4 -top-4  z-10 h-9 w-9 rounded-full bg-gray-200 p-2 shadow-md transition-all ease-in hover:cursor-pointer dark:bg-gray-950 dark:text-white  "
        />
      </Tooltip>
      <form onSubmit={updateProject}>
        <section className="relative min-w-[42rem] overflow-hidden rounded-lg bg-gray-100 transition dark:bg-gray-800 dark:text-white sm:h-[24rem]">
          <div className="flex h-full w-full flex-row">
            <div className="flex h-full w-1/2 flex-col px-4 py-6">
              <FormInput id="title" title="Title:" value={title} />
              <FormTextarea
                id="description"
                title="Description:"
                value={description}
                height="h-[9rem]"
              />
              <FormTextarea
                id="tags"
                title="Tags:"
                value={tags}
                height="h-[4rem]"
              />
            </div>
            <div className="h-full w-1/2 px-4 py-6">
              <FormInput id="url" title="Url:" value={url} />
              <FormInput id="series" title="Order:" value={series} />
              <FormUpload
                id="image"
                title="Image:"
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                setFile={setFile}
              />
            </div>
          </div>
        </section>
        <Button
          isLoading={isLoading}
          disabled={isLoading}
          className="mb-4 mt-1 w-32 bg-[#5bb0ff] font-semibold text-gray-900 shadow-md hover:bg-[#4a8dcc] hover:text-gray-100 dark:bg-[#ff9a60] dark:text-white dark:hover:bg-[#fc8c4bd0]"
        >
          Save
        </Button>
      </form>
    </div>
  );
}
