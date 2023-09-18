"use client";

import { useRef, useState } from "react";
import FormInput from "../ui/FormInput";
import FormTextarea from "../ui/FormTextarea";
import FormUpload from "../ui/FormUpload";
import { Button } from "../ui/Button";
import { shortToast } from "@/lib/helpers/shorter-function";

export default function ProjectNew() {
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [file, setFile] = useState<File>();
  const ref = useRef<HTMLDivElement>(null);

  const handleSumbit = async (e: any) => {
    e.preventDefault();
    setUploading(true);

    const target = e.target as typeof e.target & {
      title: { value: string };
      description: { value: string };
      tags: { value: string };
      url: { value: string };
      series: { value: string };
    };

    const title = target.title.value;
    const description = target.description.value;
    const tags = target.tags.value;
    const url = target.url.value;
    const series = target.series.value;

    if (!file) {
      setUploading(false);
      return;
    }

    try {
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
      let image = resObject.fileName;

      const project = {
        title,
        description,
        tags,
        url,
        image: `/images/${image}`,
        series: Number(series),
      };
      const res2 = await fetch("/api/data/projects", {
        method: "POST",
        body: JSON.stringify(project),
      });

      if (res2.status === 200) {
        shortToast(
          "Success",
          "The project was added successfully.",
          "success",
          5000
        );
      }
    } catch (e: any) {
      // Handle errors here
      console.error(e);
    }

    setUploading(false);
  };

  return (
    <div
      ref={ref}
      className="group mb-3 rounded-lg shadow-lg last:mb-0 dark:bg-gray-800 sm:mb-8"
    >
      <form onSubmit={handleSumbit}>
        <section className="relative min-w-[42rem] overflow-hidden bg-gray-100 transition dark:bg-gray-800 dark:text-white sm:h-[24rem]">
          <div className="flex h-full w-full flex-row">
            <div className="flex h-full w-1/2 flex-col px-4 py-6">
              <FormInput id="title" title="Title:" value={""} />
              <FormTextarea
                id="description"
                title="Description:"
                value={""}
                height="h-[9rem]"
              />
              <FormTextarea
                id="tags"
                title="Tags:"
                value={""}
                height="h-[4rem]"
              />
            </div>
            <div className="h-full w-1/2 px-4 py-6">
              <FormInput id="url" title="Url:" value={""} />
              <FormInput id="series" title="Order:" value={""} />
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
        <Button className="mb-4 mt-1 w-32 bg-[#5bb0ff] font-semibold text-gray-900 shadow-md hover:bg-[#4a8dcc] hover:text-gray-100 dark:bg-[#ff9a60] dark:text-white dark:hover:bg-[#fc8c4bd0]">
          Add
        </Button>
      </form>
    </div>
  );
}
