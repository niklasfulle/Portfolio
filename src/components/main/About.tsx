"use client";
import React, { FC } from "react";
import { motion } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "@/components/SectionHeading";

interface Props {
  abouteMe?: any;
}
const About: FC<Props> = ({ abouteMe }) => {
  const { ref } = useSectionInView("About");

  return (
    <section className="h-fit min-h-screen max-w-[45rem] scroll-mt-28">
      <div className="absolute right-1/2 top-[50rem] -z-20 h-[31.25rem] w-[21.25rem] translate-x-[-35%] rounded-full bg-[#866cb8] blur-[16rem] dark:bg-[#93b969] sm:w-[68.75rem]"></div>
      <div className="absolute left-1/2 top-[50rem] -z-10 h-[11.25rem] w-[21.25rem] translate-x-[-50%] rounded-full bg-[#3ec750] blur-[16rem] dark:bg-[#d8a07f] sm:w-[68.75rem]"></div>
      <div className="absolute left-1/2 top-[55rem] -z-20 h-[31.25rem] w-[21.25rem] translate-x-[35%] rounded-full bg-[#f1bbbb] blur-[16rem] dark:bg-[#ad6066] sm:w-[68.75rem]"></div>
      <motion.div
        ref={ref}
        className="scroll-mt-28 text-center leading-8"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.175 }}
        id="about"
      >
        <SectionHeading>About me</SectionHeading>
        {abouteMe.map((abouteMe: any, index: any) => (
          <motion.p
            className="mb-5 px-4 sm:px-0"
            key={index}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.175 }}
            dangerouslySetInnerHTML={{ __html: abouteMe.text }}
          ></motion.p>
        ))}
      </motion.div>
    </section>
  );
};

export default About;
