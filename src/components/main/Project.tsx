"use client";
import React, { FC, useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";
import { FaGithub } from "react-icons/fa";

type ProjectProps = {
  readonly title: string;
  readonly descriptionDe: string;
  readonly descriptionEn: string;
  readonly image: string | null;
  readonly url: string | null;
  readonly tags: string;
  readonly language: string;
}

function getProjectTypeLabel(isProfessional: boolean, language: string) {
  if (!isProfessional) return "Open source";
  return language === "de" ? "Beruflich" : "Professional";
}

function getProjectVisibilityLabel(isProfessional: boolean, language: string) {
  if (!isProfessional) return "GitHub";
  return language === "de" ? "Vertraulich" : "Confidential";
}

function getImageCaption(image: string | null, language: string) {
  if (image === "/project-randnotizen.png") {
    return language === "de"
      ? "Bild: Original-Screenshot, für die Darstellung zugeschnitten"
      : "Image: original screenshot, cropped for presentation";
  }

  if (image?.startsWith("/project-")) {
    return language === "de"
      ? "Bild: KI-generierte Illustration"
      : "Image: AI-generated illustration";
  }

  return null;
}

const Project: FC<ProjectProps> = ({
  title,
  descriptionDe,
  descriptionEn,
  image,
  url,
  tags,
  language,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0.1 1", "0.9 1"],
  });
  const scaleProgress = useTransform(scrollYProgress, [0, 1], [0.96, 1]);
  const opacityProgress = useTransform(scrollYProgress, [0, 1], [0.65, 1]);

  const tagsSplit = tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  const description = language === "de" ? descriptionDe : descriptionEn;
  const isProfessional = !url;
  const projectTypeLabel = getProjectTypeLabel(isProfessional, language);
  const projectVisibilityLabel = getProjectVisibilityLabel(isProfessional, language);
  const imageCaption = getImageCaption(image, language);

  return (
    <motion.div
      ref={ref}
      style={{
        scale: reducedMotion ? 1 : scaleProgress,
        opacity: reducedMotion ? 1 : opacityProgress,
      }}
      className="h-full"
      whileHover={reducedMotion ? undefined : { y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <article className="group flex h-full min-h-[28rem] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/75 shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70 dark:shadow-black/20">
        <figure className="shrink-0">
          <div className="relative h-48 overflow-hidden border-b border-slate-200/80 bg-slate-100 dark:border-slate-800/80 dark:bg-slate-900 sm:h-52">
            {image ? (
              <Image
                src={image}
                alt={`${title} project preview`}
                fill
                sizes="(min-width: 1024px) 31rem, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div
                aria-hidden="true"
                className="relative flex h-full items-end overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.35),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(129,140,248,0.38),transparent_34%),linear-gradient(135deg,#0f172a,#172554)] p-6"
              >
                <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full border border-cyan-300/30" />
                <div className="absolute -bottom-24 -left-8 h-56 w-56 rounded-full border border-indigo-300/20" />
              </div>
            )}

            <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/75 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md">
              {isProfessional ? (
                <BriefcaseBusiness aria-hidden="true" className="h-3.5 w-3.5 text-cyan-300" />
              ) : (
                <FaGithub aria-hidden="true" className="h-3.5 w-3.5 text-cyan-300" />
              )}
              {projectTypeLabel}
            </div>
          </div>
          {imageCaption ? (
            <figcaption className="border-b border-slate-200/80 px-5 py-2 text-[0.62rem] text-slate-500 dark:border-slate-800/80 dark:text-slate-400 sm:px-6">
              {imageCaption}
            </figcaption>
          ) : null}
        </figure>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <h3 className="text-xl font-semibold tracking-tight text-slate-950 [text-wrap:balance] dark:text-white sm:text-2xl">
            {title}
          </h3>
          <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {description}
          </p>

          <ul className="mt-5 flex flex-wrap gap-2" aria-label={language === "de" ? "Technologien" : "Technologies"}>
            {tagsSplit.map((tag) => (
              <li
                className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-cyan-700 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-200"
                key={tag}
                translate="no"
              >
                {tag}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex items-end justify-between gap-4 pt-7">
          {url ? (
            <Link
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white outline-none transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-cyan-400 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300"
            >
              <FaGithub aria-hidden="true" className="h-4 w-4" />
              {language === "de" ? "Repository öffnen" : "Open repository"}
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          ) : (
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-300/80 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {language === "de" ? "Nicht öffentlich" : "Not public"}
            </span>
          )}
            <span className="text-right text-[0.65rem] font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              {projectVisibilityLabel}
            </span>
          </div>
        </div>
      </article>
    </motion.div>
  );
};

export default Project;
