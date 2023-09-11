"use client";

import React from "react";
import { motion } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";
import toast from "react-hot-toast";
import SectionHeading from "./SectionHeading";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Button } from "./ui/Button";

export default function Contact() {
  const { ref } = useSectionInView("Contact");

  return (
    <motion.section
      id="contact"
      ref={ref}
      className="h-fit min-h-[79vh] w-[min(100%,38rem)] scroll-mt-28 text-center"
      initial={{
        opacity: 0,
      }}
      whileInView={{
        opacity: 1,
      }}
      transition={{
        duration: 1,
      }}
      viewport={{
        once: true,
      }}
    >
      <SectionHeading>Contact me</SectionHeading>

      <p className="-mt-6 text-gray-700 dark:text-white/80">
        Please contact me directly at{" "}
        <a className="underline" href="mailto:example@gmail.com">
          example@gmail.com
        </a>{" "}
        or through this form.
      </p>

      <form className="mt-10 flex flex-col items-center dark:text-black">
        <Input
          className="mt-4 h-14 rounded-lg border border-gray-700 px-4 shadow-md transition-all focus:ring-[#5bb0ff] dark:bg-white dark:outline-none dark:focus:ring-[#ff9a60]"
          name="senderEmail"
          type="email"
          required
          maxLength={500}
          placeholder="Your email"
        />
        <Input
          className="mt-4 h-14 rounded-lg border border-gray-700 px-4 shadow-md transition-all focus:ring-[#5bb0ff] dark:bg-white dark:outline-none dark:focus:ring-[#ff9a60]"
          name="senderEmail"
          type="email"
          required
          maxLength={500}
          placeholder="Your Topic"
        />
        <Textarea
          className="mt-4 h-52 rounded-lg border border-gray-700 p-4 shadow-md transition-all focus:ring-[#5bb0ff] dark:bg-white dark:outline-none dark:focus:ring-[#ff9a60]"
          name="message"
          placeholder="Your message"
          required
          maxLength={5000}
        />
        <Button className="mt-6 w-2/6 bg-[#5bb0ff] font-semibold text-gray-900 shadow-md hover:bg-[#4a8dcc] hover:text-gray-100 dark:bg-[#ff9a60] dark:text-white dark:hover:bg-[#fc8c4bd0]">
          Send
        </Button>
      </form>
    </motion.section>
  );
}
