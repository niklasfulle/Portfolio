"use client";
import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "@/components/SectionHeading";
import { Input } from "@/ui/Input";
import { Textarea } from "@/ui/Textarea";
import { Button } from "@/ui/Button";
import { shortToast } from "@/lib/helpers/shorter-function";
import { useLanguage } from "@/context/language-context";

interface ContactProps {
  contactEmail: string;
}

const Contact = ({ contactEmail }: ContactProps) => {
  const { language } = useLanguage();
  const [sendingEmail, setSendingEmail] = useState(false);
  const { ref } = useSectionInView("Contact");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSendingEmail(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);

      const data = {
        senderEmail: formData.get("senderEmail"),
        topic: formData.get("topic"),
        message: formData.get("message"),
      };

      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(`Contact request failed with status ${res.status}`);
      }

      shortToast(
        "Success",
        "The message was sent successfully.",
        "success",
        5000,
      );
      form.reset();
    } catch (error) {
      console.error("Failed to send contact form", error);
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
      <SectionHeading eyebrow={language === "de" ? "Kontakt" : "Get in touch"}>
        {language === "de" ? "Kontaktiere mich" : "Contact me"}
      </SectionHeading>

      <p className="-mt-6 text-gray-700 dark:text-white/80">
        {language === "de"
          ? "Bitte kontaktiere mich direkt unter "
          : "Please contact me directly at "}
        <a className="underline" href={`mailto:${contactEmail}`}>
          {contactEmail}
        </a>
        {language === "de"
          ? " oder über dieses Formular."
          : " or through this form."}
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
          maxLength={254}
          placeholder={
            language === "de" ? "Deine E-Mail" : "Your email"
          }
        />
        <Input
          className="mt-4 h-14 rounded-lg border border-gray-700 px-4 shadow-md transition-all placeholder:text-gray-900 focus:ring-[#5bb0ff] dark:bg-white dark:outline-none dark:focus:ring-[#ff9a60]"
          name="topic"
          type="text"
          required
          maxLength={200}
          placeholder={
            language === "de" ? "Deine Thema" : "Your Topic"
          }
        />
        <Textarea
          className="mt-4 h-52 rounded-lg border border-gray-700 p-4 shadow-md transition-all placeholder:text-gray-900 focus:ring-[#5bb0ff] dark:bg-white dark:outline-none dark:focus:ring-[#ff9a60]"
          name="message"
          placeholder={
            language === "de"
              ? "Deine Nachricht"
              : "Your message"
          }
          required
          maxLength={5000}
        />
        <Button
          isLoading={sendingEmail}
          disabled={sendingEmail}
          className="mt-6 w-2/6 bg-[#5bb0ff] font-semibold text-gray-900 shadow-md hover:bg-[#4a8dcc] hover:text-gray-100 dark:bg-[#ff9a60] dark:text-white dark:hover:bg-[#fc8c4bd0]"
        >
          {language === "de" ? "Senden" : "Send"}
        </Button>
      </form>
    </motion.section>
  );
};

export default Contact;
