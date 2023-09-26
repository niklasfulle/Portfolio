"use client";

import React, { useState } from "react";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "@/components/SectionHeading";
import { Input } from "@/ui/Input";
import { Textarea } from "@/ui/Textarea";
import { Button } from "@/ui/Button";
import { Save } from "lucide-react";
import { Tooltip } from "@mui/material";
import { shortToast } from "@/lib/helpers/shorter-function";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  contactEmail: string;
}

const Contact = ({ contactEmail, id }: Props) => {
  const [edit, setEdit] = useState(false);
  const [email, setEmail] = useState(contactEmail);
  const { ref } = useSectionInView("Contact");
  const router = useRouter();

  const saveContactEmail = async () => {
    try {
      const res = await fetch("/api/data/contact", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          email,
        }),
      });

      if (res.status === 200) {
        shortToast(
          "Success",
          "The contact email was updated successfully",
          "success",
          5000
        );
        router.refresh();
      }
    } catch (error) {
      console.log(error);
    }

    setEdit(false);
  };

  return (
    <section
      id="contact"
      ref={ref}
      className="relative flex h-fit min-h-screen w-5/6 scroll-mt-28 flex-col items-center border border-black text-center dark:border-white"
    >
      {!edit && (
        <Button
          className="absolute right-2 top-2 min-w-[6rem] bg-gray-800 font-semibold text-white shadow-md  hover:bg-gray-600 dark:text-black dark:hover:bg-gray-400"
          onClick={() => setEdit(true)}
        >
          Edit
        </Button>
      )}
      {edit && (
        <>
          <Button
            className="absolute right-2 top-2 min-w-[6rem] bg-gray-800 font-semibold text-white shadow-md  hover:bg-gray-600 dark:text-black dark:hover:bg-gray-400"
            onClick={() => setEdit(false)}
          >
            Close
          </Button>
        </>
      )}
      <SectionHeading>Contact me</SectionHeading>

      <p className="-mt-6 text-gray-700 dark:text-white/80">
        Please contact me directly at{" "}
        {!edit && (
          <a className="underline" href={`mailto:${email}`}>
            {email}{" "}
          </a>
        )}
        {edit && (
          <span className="relative flex flex-row">
            <Input
              className="dark:border-white dark:text-white"
              type="email"
              defaultValue={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Tooltip title="Save" placement="right">
              <Save
                onClick={() => saveContactEmail()}
                className="ml-3 h-10 w-10 cursor-pointer"
              />
            </Tooltip>
          </span>
        )}
        or through this form.
      </p>

      <form className="mt-10 flex w-[min(100%,38rem)] flex-col items-center dark:text-black">
        <Input
          className="mt-4 h-14 rounded-lg border border-gray-700 px-4 shadow-md transition-all placeholder:text-gray-900 focus:ring-[#5bb0ff] dark:bg-white dark:outline-none dark:focus:ring-[#ff9a60]"
          name="senderEmail"
          type="email"
          required
          maxLength={500}
          placeholder="Your email"
        />
        <Input
          className="mt-4 h-14 rounded-lg border border-gray-700 px-4 shadow-md transition-all placeholder:text-gray-900 focus:ring-[#5bb0ff] dark:bg-white dark:outline-none dark:focus:ring-[#ff9a60]"
          name="senderEmail"
          type="email"
          required
          maxLength={500}
          placeholder="Your Topic"
        />
        <Textarea
          className="mt-4 h-52 rounded-lg border border-gray-700 p-4 shadow-md transition-all placeholder:text-gray-900 focus:ring-[#5bb0ff] dark:bg-white dark:outline-none dark:focus:ring-[#ff9a60]"
          name="message"
          placeholder="Your message"
          required
          maxLength={5000}
        />
        <Button className="mt-6 w-2/6 bg-[#5bb0ff] font-semibold text-gray-900 shadow-md hover:bg-[#4a8dcc] hover:text-gray-100 dark:bg-[#ff9a60] dark:text-white dark:hover:bg-[#fc8c4bd0]">
          Send
        </Button>
      </form>
    </section>
  );
};

export default Contact;
