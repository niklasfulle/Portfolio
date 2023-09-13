"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";
import { useSectionInView } from "@/lib/hooks";
import { useActiveSectionContext } from "@/context/active-section-context";
import SectionHeading from "@/components/SectionHeading";

export default function Intro() {
  const { ref } = useSectionInView("Home", 0.5);
  const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext();

  return (
    <section
      ref={ref}
      id="home"
      className="h-fit min-h-screen w-5/6 scroll-mt-28 border border-black text-center dark:border-white"
    >
      <div>
        <SectionHeading>Niklas Fulle</SectionHeading>
      </div>
      <div className="flex items-center justify-center">
        <div className="relative">
          <div>
            <Image
              src="https://avatars.githubusercontent.com/u/36989748?s=400&u=bb05585eac7349855b6c5039ea699362e543966b&v=4"
              alt="Niklas Fulle profile picture"
              width="192"
              height="192"
              quality="95"
              priority={true}
              className="h-24 w-24 rounded-full border-[0.2rem] border-white object-cover shadow-xl"
            />
            <div>
              <span className="absolute bottom-0 right-0 text-4xl">👋</span>
            </div>
          </div>
        </div>
      </div>

      <h1 className="mb-10 mt-4 px-4 text-2xl font-medium !leading-[1.5] sm:text-4xl">
        <span className="font-bold">Hello, I&apos;m Niklas.</span>
      </h1>

      <div className="flex flex-col items-center justify-center gap-2 px-4 text-lg font-medium sm:flex-row">
        <Link
          href="#contact"
          className="group flex items-center gap-2 rounded-full bg-gray-900 px-7 py-3 text-white shadow-md outline-none transition hover:scale-110 hover:bg-gray-950 focus:scale-110 active:scale-105"
          onClick={() => {
            setActiveSection("Contact");
            setTimeOfLastClick(Date.now());
          }}
        >
          Contact me here{" "}
          <BsArrowRight className="opacity-70 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
