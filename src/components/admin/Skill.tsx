import React, { FC } from "react";

interface SkillProps {
  name: string;
}

const Skill: FC<SkillProps> = ({ name }) => {
  return (
    <div className="rounded-xl border border-black bg-white px-5 py-3 shadow-sm dark:border-white/30 dark:bg-gray-800 dark:text-white/80">
      {name}
    </div>
  );
};

export default Skill;
