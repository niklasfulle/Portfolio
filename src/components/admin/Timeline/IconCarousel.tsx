import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import React, { FC } from "react";
import { CgWorkAlt } from "react-icons/cg";
import { FaReact } from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";

interface IconCarouselProps {
  position: "left" | "right";
  icon: string;
  setIcon: any;
}

const switchIcons = (icon: string) => {
  switch (icon) {
    case "FaReact":
      return <FaReact className="h-7 w-7" />;
    case "CgWorkAlt":
      return <CgWorkAlt className="h-7 w-7" />;
    case "LuGraduationCap":
      return <LuGraduationCap className="h-7 w-7" />;
    default:
      return <FaReact className="h-7 w-7" />;
  }
};

const icons = ["FaReact", "CgWorkAlt", "LuGraduationCap"];

const IconCarousel: FC<IconCarouselProps> = ({ position, icon, setIcon }) => {
  let index = icons.indexOf(icon);
  if (icon === "") {
    index = 0;
  }

  const moveUp = () => {
    if (index === icons.length - 1) {
      index = 0;
    } else {
      index++;
    }
    setIcon(icons[index]);
  };

  const moveDown = () => {
    if (index === 0) {
      index = icons.length - 1;
    } else {
      index--;
    }

    setIcon(icons[index]);
  };

  const iconCSS =
    position === "left"
      ? "right-0 left-12 md:right-16 md:left-auto"
      : " left-12 md:left-16 md:right-auto";

  const arrowCSS = position === "left" ? "right-[4.3rem]" : "left-[4.3rem]";
  return (
    <div>
      <ChevronUp
        onClick={moveUp}
        className={cn(
          "absolute top-[28%] z-10 h-10 w-10 cursor-pointer active:scale-[115%]",
          arrowCSS
        )}
      />
      <i
        className={cn(
          "absolute top-14 z-10 flex h-12 w-12 flex-row items-center justify-center rounded-full border-[.14rem] border-solid border-black  text-center text-lg dark:border-white dark:text-white md:top-[calc(50%_-_24px)]",
          iconCSS
        )}
      >
        {switchIcons(icon)}
      </i>
      <ChevronDown
        onClick={moveDown}
        className={cn(
          "absolute bottom-[28%] right-[4.3rem] z-10 h-10 w-10 cursor-pointer active:scale-[115%]",
          arrowCSS
        )}
      />
    </div>
  );
};

export default IconCarousel;
