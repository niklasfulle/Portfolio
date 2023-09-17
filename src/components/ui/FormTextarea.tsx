import React, { FC } from "react";
import { Textarea } from "@/ui/Textarea";
interface FormTextareaProps {
  id: string;
  title: string;
  value: string;
}

const FormTextarea: FC<FormTextareaProps> = ({ id, title, value }) => {
  return (
    <div className="mb-2.5">
      <label
        htmlFor={id}
        className="block pl-2 text-left text-sm font-medium leading-6 text-gray-900 dark:text-white"
      >
        {title}
      </label>
      <div className="mt-0.5">
        <Textarea
          id={id}
          name={id}
          required
          defaultValue={value}
          className="px-l block h-fit max-h-[6rem] w-full rounded-md border-0 py-1.5 text-sm leading-6 text-gray-900 ring-1 ring-inset ring-gray-500 transition-all ease-in placeholder:text-gray-400 focus:ring-indigo-600 dark:text-white dark:ring-white dark:focus:ring-sky-400 dark:focus:ring-offset-slate-700"
        ></Textarea>
      </div>
    </div>
  );
};

export default FormTextarea;
