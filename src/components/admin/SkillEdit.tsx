import { Tooltip } from "@mui/material";
import { Check, Pencil, X } from "lucide-react";
import React, { FC, useState } from "react";
import { Input } from "../ui/Input";
import { shortToast } from "@/lib/helpers/shorter-function";
import { useRouter } from "next/navigation";

interface SkillEditProps {
  id: string;
  skill: string;
}

const SkillEdit: FC<SkillEditProps> = ({ skill, id }) => {
  const [editSkill, setEditSkill] = useState<string>(skill);
  const [edit, setEdit] = useState<boolean>(false);
  const router = useRouter();

  const updateSkill = async () => {
    try {
      if (editSkill === "") {
        const res = await fetch(`/api/data/skills`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        });

        if (res.ok) {
          setEdit(false);
          shortToast(
            "Success",
            "The Skill was deleted successfully.",
            "success",
            5000
          );
          router.refresh();
        }
      } else {
        const data = {
          name: editSkill,
          id: id,
        };
        const res = await fetch(`/api/data/skills`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data }),
        });

        if (res.ok) {
          shortToast(
            "Success",
            "The Skill was updated successfully.",
            "success",
            5000
          );
          router.refresh();
          setEdit(false);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {edit ? (
        <div className="relative rounded-xl border border-black bg-white p-1.5 shadow-sm dark:border-white/30 dark:bg-gray-800 dark:text-white/80">
          <Input
            value={editSkill}
            onChange={(e) => {
              setEditSkill(e.target.value);
            }}
            className="w-24 dark:text-white"
          />
          <Tooltip title="Close" placement="right">
            <X
              onClick={() => setEdit(false)}
              className="absolute -right-4 -top-4 z-10 h-7 w-7 rounded-full bg-gray-300 p-1 shadow-md transition-all ease-in hover:cursor-pointer hover:bg-red-300 dark:bg-gray-950 dark:text-white hover:dark:bg-red-800"
            />
          </Tooltip>
          <Tooltip title="Save" placement="right">
            <Check
              onClick={updateSkill}
              className="absolute -bottom-4 -right-4 z-10 h-7 w-7 rounded-full bg-gray-300 p-1 shadow-md transition-all ease-in hover:cursor-pointer hover:bg-green-300 dark:bg-gray-950 dark:text-white hover:dark:bg-green-700"
            />
          </Tooltip>
        </div>
      ) : (
        <div className="relative rounded-xl border border-black bg-white px-5 py-3 shadow-sm dark:border-white/30 dark:bg-gray-800 dark:text-white/80">
          {editSkill}
          <Tooltip title="Edit" placement="right">
            <Pencil
              onClick={() => setEdit(true)}
              className="absolute -right-4 -top-4 z-10 h-7 w-7 rounded-lg bg-gray-300 p-1 shadow-md transition-all ease-in hover:cursor-pointer hover:bg-red-300 dark:bg-gray-950 dark:text-white hover:dark:bg-green-700"
            />
          </Tooltip>
        </div>
      )}
    </>
  );
};

export default SkillEdit;
