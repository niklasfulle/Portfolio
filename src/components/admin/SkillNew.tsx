import { Tooltip } from "@mui/material";
import { Save, X } from "lucide-react";
import React, { FC, useState } from "react";
import { Input } from "../ui/Input";
import { shortToast } from "@/lib/helpers/shorter-function";
import { useRouter } from "next/navigation";

interface SkillNewProps {
  setNew: any;
  type: string;
}

const SkillNew: FC<SkillNewProps> = ({ setNew, type }) => {
  const [skill, setSkill] = useState<string>("");
  const router = useRouter();

  const createSkill = async () => {
    if (skill === "" || skill === " ")
      return shortToast("Error", "The Skill cannot be empty.", "error", 5000);

    try {
      const data = {
        name: skill,
        type: type,
      };
      const res = await fetch(`/api/data/skills`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });

      if (res.ok) {
        shortToast(
          "Success",
          "The Skill was created successfully.",
          "success",
          5000
        );
        router.refresh();
        setNew(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="relative rounded-xl border border-black bg-white p-1.5 shadow-sm dark:border-white/30 dark:bg-gray-800 dark:text-white/80">
      <Tooltip title="Remove" placement="right">
        <X
          onClick={() => setNew(false)}
          className="absolute -right-4 -top-4 z-10 h-7 w-7 rounded-full bg-gray-300 p-1 shadow-md transition-all ease-in hover:cursor-pointer hover:bg-red-300 dark:bg-gray-950 dark:text-white hover:dark:bg-red-800"
        />
      </Tooltip>
      <Tooltip title="Save" placement="right">
        <Save
          onClick={createSkill}
          className="absolute -bottom-4 -right-4 z-10 h-7 w-7 rounded-full bg-gray-300 p-1 shadow-md transition-all ease-in hover:cursor-pointer hover:bg-green-300 dark:bg-gray-950 dark:text-white hover:dark:bg-green-700"
        />
      </Tooltip>
      <Input
        autoFocus
        onChange={(e) => {
          setSkill(e.target.value);
        }}
        placeholder={type}
        className="w-24 dark:text-white"
        required
      />
    </div>
  );
};

export default SkillNew;
