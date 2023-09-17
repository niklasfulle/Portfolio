"use client";

import { useRef } from "react";
import FormInput from "../ui/FormInput";
import FormTextarea from "../ui/FormTextarea";
import FormUpload from "../ui/FormUpload";
import { Button } from "../ui/Button";

export default function ProjectNew() {
  const ref = useRef<HTMLDivElement>(null);

  const handleSumbit = (e: any) => {
    e.preventDefault();
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
              <FormTextarea id="description" title="Description:" value={""} />
              <FormTextarea id="tags" title="Tags:" value={""} />
            </div>
            <div className="h-full w-1/2 px-4 py-6">
              <FormInput id="url" title="Url:" value={""} />
              <FormUpload id="image" title="Image:" image={""} />
            </div>
          </div>
        </section>
        <Button className="mb-4 w-32 bg-[#5bb0ff] font-semibold text-gray-900 shadow-md hover:bg-[#4a8dcc] hover:text-gray-100 dark:bg-[#ff9a60] dark:text-white dark:hover:bg-[#fc8c4bd0]">
          Add
        </Button>
      </form>
    </div>
  );
}
