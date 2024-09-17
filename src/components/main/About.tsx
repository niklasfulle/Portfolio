"use client";
import React, { FC, useState } from "react";
import { motion } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "@/components/SectionHeading";
import { AbouteMeType } from "@/lib/types";
import { useSearchParams } from "next/navigation";

interface AboutProps {
  abouteMe: AbouteMeType[];
}
const About: FC<AboutProps> = ({ abouteMe }) => {
  const searchParams = useSearchParams();
  const search = searchParams.get("language");
  const [language, setLanguag] = useState(search ?? "de");

  const { ref } = useSectionInView("About");

  return (
    <section className="h-fit min-h-screen max-w-[45rem] scroll-mt-28">
      <motion.div
        ref={ref}
        className="scroll-mt-28 text-center leading-8"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.175 }}
        id="about"
      >
        <SectionHeading>
          {language === "de" ? ("Über mich" ?? "") : ("About me" ?? "")}
        </SectionHeading>
        {abouteMe.map((abouteMe: AbouteMeType, index: number) => (
          <motion.p
            className="mb-5 px-4 sm:px-0"
            key={index}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.175 }}
            dangerouslySetInnerHTML={{
              __html:
                language === "de"
                  ? (abouteMe.textDe ?? "")
                  : (abouteMe.textEn ?? ""),
            }}
          ></motion.p>
        ))}
      </motion.div>
    </section>
  );
};

export default About;
