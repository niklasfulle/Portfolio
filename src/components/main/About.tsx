"use client";
import React, { FC } from "react";
import { motion } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "@/components/SectionHeading";
import { AbouteMeType } from "@/lib/types";

interface AboutProps {
  abouteMe: AbouteMeType[];
}
const About: FC<AboutProps> = ({ abouteMe }) => {
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
        <SectionHeading>About me</SectionHeading>
        {abouteMe.map((abouteMe: AbouteMeType, index: number) => (
          <motion.p
            className="mb-5 px-4 sm:px-0"
            key={index}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.175 }}
            dangerouslySetInnerHTML={{ __html: abouteMe.text as any }}
          ></motion.p>
        ))}
      </motion.div>
    </section>
  );
};

export default About;
