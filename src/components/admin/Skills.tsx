"use client";
import React, { FC, useState } from "react";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "../ui/Button";
import { Plus } from "lucide-react";

import SkillEdit from "./SkillEdit";
import SkillNew from "./SkillNew";
import Skill from "./Skill";
import { Tooltip } from "@mui/material";

interface SkillsProps {
  skills: Skill[];
  learn: Skill[];
}

const Skills: FC<SkillsProps> = ({ skills, learn }) => {
  const [edit, setEdit] = useState<boolean>(false);
  const [newSkill, setNewSkill] = useState<boolean>(false);
  const [newLearn, setNewLearn] = useState<boolean>(false);
  const { ref } = useSectionInView("Skills");

  return (
    <section
      id="skills"
      ref={ref}
      className="relative flex h-fit min-h-screen w-5/6 scroll-mt-28 flex-col items-center border border-black text-center dark:border-white"
    >
      {!edit && (
        <Button
          className="absolute right-2 top-2 min-w-[6rem] bg-gray-800 font-semibold text-white shadow-md hover:bg-gray-600 dark:text-black dark:hover:bg-gray-400"
          onClick={() => {
            setEdit(true);
          }}
        >
          Edit
        </Button>
      )}
      {edit && (
        <>
          <Button
            className="absolute right-2 top-2 min-w-[6rem] bg-gray-800 font-semibold text-white shadow-md hover:bg-gray-600 dark:text-black dark:hover:bg-gray-400"
            onClick={() => {
              setEdit(false);
              setNewSkill(false);
              setNewLearn(false);
            }}
          >
            Close
          </Button>
        </>
      )}
      <SectionHeading>My skills</SectionHeading>
      <ul className="mb-16 flex max-w-[53rem] flex-wrap items-center justify-center gap-8 text-lg text-gray-800">
        {!edit && (
          <>
            {skills.map((skill: Skill, index: number) => (
              <li key={index + "skill"}>
                <Skill name={skill.name} />
              </li>
            ))}
          </>
        )}
        {edit && (
          <>
            {skills.map((skill: Skill, index: number) => (
              <li key={index + "learnEdit"}>
                <SkillEdit skill={skill.name} id={skill.id} />
              </li>
            ))}
            {newSkill ? (
              <li key={"skillCreate"} className="ml-4">
                <SkillNew setNew={setNewSkill} type="skill" />
              </li>
            ) : (
              <Tooltip title="New" placement="right">
                <li
                  key={"skillCreatePlus"}
                  onClick={() => setNewSkill(true)}
                  className="ml-4 rounded-full border border-black bg-white p-1.5 shadow-sm transition-all ease-in hover:cursor-pointer dark:border-white/30 dark:bg-gray-950 dark:text-white/80 hover:dark:bg-gray-900"
                >
                  <Plus />
                </li>
              </Tooltip>
            )}
          </>
        )}
      </ul>
      <SectionHeading>I want to learn</SectionHeading>
      <ul className="mb-16 flex flex-wrap items-center justify-center gap-8 text-lg text-gray-800">
        {!edit && (
          <>
            {learn.map((learn: Skill, index: number) => (
              <li key={index + "learn"}>
                <Skill name={learn.name} />
              </li>
            ))}
          </>
        )}
        {edit && (
          <>
            {learn.map((learn: Skill, index: number) => (
              <li key={index + "learnEdit"}>
                <SkillEdit skill={learn.name} id={learn.id} />
              </li>
            ))}

            {newLearn ? (
              <li key={"learnCreate"} className="ml-4">
                <SkillNew setNew={setNewLearn} type="learn" />
              </li>
            ) : (
              <Tooltip title="New" placement="right">
                <li
                  key={"learnCreatePlus"}
                  onClick={() => setNewLearn(true)}
                  className="ml-4 rounded-full border border-black bg-white p-1.5 shadow-sm transition-all ease-in hover:cursor-pointer dark:border-white/30 dark:bg-gray-950 dark:text-white/80 hover:dark:bg-gray-900"
                >
                  <Plus />
                </li>
              </Tooltip>
            )}
          </>
        )}
      </ul>
    </section>
  );
};

export default Skills;
