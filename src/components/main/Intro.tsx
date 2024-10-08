"use client";
import Image from "next/image";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BsArrowRight } from "react-icons/bs";
import { useSectionInView } from "@/lib/hooks";
import { useActiveSectionContext } from "@/context/active-section-context";
import SectionHeading from "@/components/SectionHeading";
import { useSearchParams } from "next/navigation";

export default function Intro() {
  const searchParams = useSearchParams();
  const search = searchParams.get("language");
  const [language, setLanguag] = useState(search ?? "de");

  const { ref } = useSectionInView("Home", 0.5);
  const { setActiveSection, setTimeOfLastClick } = useActiveSectionContext();

  return (
    <section
      ref={ref}
      id="home"
      className="h-fit min-h-screen max-w-[50rem] scroll-mt-36 text-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: "tween",
          duration: 0.2,
        }}
      >
        <SectionHeading>Niklas Fulle</SectionHeading>
      </motion.div>
      <div className="flex items-center justify-center">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "tween",
              duration: 0.2,
            }}
          >
            <Image
              src="https://avatars.githubusercontent.com/u/36989748?s=400&u=bb05585eac7349855b6c5039ea699362e543966b&v=4"
              alt="Niklas Fulle profile picture"
              width="192"
              height="192"
              quality="95"
              priority={true}
              className="h-24 w-24 rounded-full border-[0.2rem] border-white object-cover shadow-xl"
            />
          </motion.div>

          <motion.span
            className="absolute bottom-0 right-0 text-4xl"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 125,
              delay: 0.1,
              duration: 0.7,
            }}
          >
            👋
          </motion.span>
        </div>
      </div>

      <motion.h1
        className="mb-10 mt-4 px-4 text-2xl font-medium !leading-[1.5] sm:text-4xl"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="font-bold">
          {language === "de"
            ? ("Hallo, ich bin Niklas." ?? "")
            : ("Hello, I'm Niklas." ?? "")}
        </span>
      </motion.h1>

      <motion.div
        className="flex flex-col items-center justify-center gap-2 px-4 text-lg font-medium sm:flex-row"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.1,
        }}
      >
        <Link
          href="#contact"
          className="group flex items-center gap-2 rounded-full bg-gray-900 px-7 py-3 text-white shadow-md outline-none transition hover:scale-110 hover:bg-gray-950 focus:scale-110 active:scale-105"
          onClick={() => {
            setActiveSection("Contact");
            setTimeOfLastClick(Date.now());
          }}
        >
          {language === "de"
            ? ("Kontaktiere mich hier " ?? "")
            : ("Contact me here " ?? "")}

          <BsArrowRight className="opacity-70 transition group-hover:translate-x-1" />
        </Link>
      </motion.div>
      <motion.div
        className="mt-8 flex flex-col items-center justify-center px-4"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
        }}
      >
        <img src="https://github-readme-stats.vercel.app/api?username=niklasfulle&theme=algolia&show_icons=true&count_private=true&custom_title=Niklas%27s%20Github%20Stats&hide=contribs&card_width=500" />
      </motion.div>
      <motion.div
        className="mt-4 flex flex-col items-center justify-center px-4"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.4,
        }}
      >
        <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=niklasfulle&theme=algolia&layout=compact&langs_count=20&hide_progress=false&hide=mdx,glsl&card_width=500&custom_title=My%20Most%20Used%20Languages" />
      </motion.div>
    </section>
  );
}
