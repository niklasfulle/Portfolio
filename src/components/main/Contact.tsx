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

      <p className="mx-auto -mt-6 max-w-xl text-slate-600 dark:text-slate-300">
        {language === "de"
          ? "Bitte kontaktiere mich direkt unter "
          : "Please contact me directly at "}
        <a
          className="font-semibold text-cyan-700 underline decoration-cyan-500/40 underline-offset-4 transition-colors hover:text-cyan-500 dark:text-cyan-300 dark:hover:text-cyan-200"
          href={`mailto:${contactEmail}`}
        >
          {contactEmail}
        </a>
        {language === "de"
          ? " oder über dieses Formular."
          : " or through this form."}
      </p>

      <div className="relative mt-10 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/45 p-5 text-left shadow-[0_20px_70px_-35px_rgba(8,145,178,0.45)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/30 dark:shadow-[0_20px_70px_-35px_rgba(34,211,238,0.25)] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl dark:bg-cyan-400/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-500/10" />
        <form
          onSubmit={handleSubmit}
          className="relative z-10 flex flex-col gap-4"
        >
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200" htmlFor="senderEmail">
            {language === "de" ? "E-Mail-Adresse" : "Email address"}
          </label>
          <Input
            id="senderEmail"
            className="h-12 rounded-xl border-slate-300/80 bg-white/75 px-4 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/30 dark:border-white/15 dark:bg-slate-900/65 dark:text-white dark:focus:border-cyan-300 dark:focus:ring-cyan-300/25"
            name="senderEmail"
            type="email"
            required
            maxLength={254}
            placeholder={language === "de" ? "name@beispiel.de" : "name@example.com"}
          />

          <label className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200" htmlFor="topic">
            {language === "de" ? "Betreff" : "Subject"}
          </label>
          <Input
            id="topic"
            className="h-12 rounded-xl border-slate-300/80 bg-white/75 px-4 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/30 dark:border-white/15 dark:bg-slate-900/65 dark:text-white dark:focus:border-cyan-300 dark:focus:ring-cyan-300/25"
            name="topic"
            type="text"
            required
            maxLength={200}
            placeholder={language === "de" ? "Worum geht es?" : "What is it about?"}
          />

          <label className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200" htmlFor="message">
            {language === "de" ? "Nachricht" : "Message"}
          </label>
          <Textarea
            id="message"
            className="min-h-44 rounded-xl border-slate-300/80 bg-white/75 p-4 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/30 dark:border-white/15 dark:bg-slate-900/65 dark:text-white dark:focus:border-cyan-300 dark:focus:ring-cyan-300/25"
            name="message"
            placeholder={language === "de" ? "Deine Nachricht ..." : "Your message ..."}
            required
            maxLength={5000}
          />
          <Button
            isLoading={sendingEmail}
            disabled={sendingEmail}
            className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-7 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition-transform hover:scale-[1.01] hover:from-cyan-300 hover:to-blue-400 dark:from-cyan-300 dark:to-violet-500 dark:hover:from-cyan-200 dark:hover:to-violet-400 sm:w-fit"
          >
            {language === "de" ? "Nachricht senden" : "Send message"}
          </Button>
        </form>
      </div>
    </motion.section>
  );
};

export default Contact;
