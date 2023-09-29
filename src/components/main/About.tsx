"use client";
import React, { FC } from "react";
import SectionHeading from "@/components/SectionHeading";
import { AbouteMeType } from "@/lib/types";

interface AboutProps {
  abouteMe: AbouteMeType[];
}
const About: FC<AboutProps> = ({ abouteMe }) => {
  //const { ref } = useSectionInView("About");

  return (
    <section className="h-fit min-h-screen max-w-[45rem] scroll-mt-28">
      <div
        //ref={ref}
        className="scroll-mt-28 text-center leading-8"
        id="about"
      >
        <SectionHeading>About me</SectionHeading>
        {abouteMe.map((abouteMe: AbouteMeType, index: number) => (
          <p
            className="mb-5 px-4 sm:px-0"
            key={index}
            dangerouslySetInnerHTML={{ __html: abouteMe.text as any }}
          ></p>
        ))}
      </div>
    </section>
  );
};

export default About;
