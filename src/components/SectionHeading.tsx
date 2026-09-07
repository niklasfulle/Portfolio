import React from "react";

type SectionHeadingProps = {
  readonly children: React.ReactNode;
  readonly eyebrow?: React.ReactNode;
  readonly align?: "left" | "center";
};

export default function SectionHeading({
  children,
  eyebrow,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div className={`mb-8 w-full ${align === "center" ? "text-center" : "text-left"}`}>
      {eyebrow ? (
        <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl font-medium tracking-tight text-slate-950 dark:text-white sm:text-4xl">
        {children}
      </h2>
    </div>
  );
}
