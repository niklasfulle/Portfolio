"use client";
import React, { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "@/components/SectionHeading";
import { Input } from "@/ui/Input";
import { Textarea } from "@/ui/Textarea";
import { Button } from "@/ui/Button";
import { shortToast } from "@/lib/helpers/shorter-function";

interface Props {
  contactEmail: string;
}

const Contact = ({ contactEmail }: Props) => {
  const [sendingEmail, setSendingEmail] = useState(false);
  const { ref } = useSectionInView("Contact");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSendingEmail(true);

    try {
      const formData = new FormData(e.currentTarget);

      const data = {
        contactEmail,
        senderEmail: formData.get("senderEmail"),
        topic: formData.get("topic"),
        message: formData.get("message"),
      };

      const res = await fetch("/api/email/send", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (res.status === 200) {
        shortToast(
          "Success",
          "The message was sent successfully.",
          "success",
          5000
        );
      }

      e.target.reset();
    } catch (error) {
      shortToast(
        "Error",
        "There was an error sending the message.",
        "error",
        5000
      );
    }

    setSendingEmail(false);
  };

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
        <a className="underline" href={`mailto:${contactEmail}`}>
          {contactEmail}
        </a>{" "}
        or through this form.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-10 flex flex-col items-center dark:text-black"
      >
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
          name="topic"
          type="text"
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
        <Button
          isLoading={sendingEmail}
          disabled={sendingEmail}
          className="mt-6 w-2/6 bg-[#5bb0ff] font-semibold text-gray-900 shadow-md hover:bg-[#4a8dcc] hover:text-gray-100 dark:bg-[#ff9a60] dark:text-white dark:hover:bg-[#fc8c4bd0]"
        >
          Send
        </Button>
      </form>
    </motion.section>
  );
};

export default Contact;
