"use client";
import React, { FC, useState } from "react";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/ui/Button";
import { Textarea } from "@/ui/Textarea";
import { Trash } from "lucide-react";

interface Props {
  abouteMe?: any;
}

const About: FC<Props> = ({ abouteMe }) => {
  const [edit, setEdit] = useState(false);
  const [count, setCount] = useState(abouteMe.length);
  const [texts, setTexts] = useState(abouteMe);

  const addTextarea = (e: any) => {
    e.preventDefault();
    if (count > 3) return;
    setCount(count + 1);
    setTexts([...texts, { id: count + 1, text: "" }]);
  };

  const removeTextarea = (e: any, remove: string) => {
    e.preventDefault();
    if (count < 2) return;
    setCount(count - 1);
    const arrayRemove = abouteMe.filter(function (abouteMe: any) {
      return abouteMe.id !== remove;
    });
    setTexts(arrayRemove);
  };

  const { ref } = useSectionInView("About");

  return (
    <section className="relative flex h-fit min-h-screen w-5/6 scroll-mt-28 flex-col items-center border border-black text-center dark:border-white">
      {!edit && (
        <Button
          className="absolute right-2 top-2 min-w-[6rem] bg-gray-800 font-semibold text-white shadow-md  hover:bg-gray-600 dark:text-black dark:hover:bg-gray-400"
          onClick={() => setEdit(true)}
        >
          Edit
        </Button>
      )}
      {edit && (
        <Button
          className="absolute right-2 top-2 min-w-[rem] bg-gray-800 font-semibold text-white shadow-md  hover:bg-gray-600 dark:text-black dark:hover:bg-gray-400"
          onClick={() => setEdit(false)}
        >
          Close
        </Button>
      )}
      <div
        ref={ref}
        className="max-w-[45rem] scroll-mt-28 text-center leading-8"
        id="about"
      >
        <SectionHeading>About me</SectionHeading>
        {edit && (
          <form>
            {texts.map((abouteMe: any, index: any) => (
              <>
                <div className="flex flex-row items-center justify-between">
                  <h4 className="mx-4 text-left" key={"h4" + index}>
                    Text {abouteMe.id}:
                  </h4>
                  <Trash
                    className="hover:cursor-pointer"
                    onClick={(e) => removeTextarea(e, abouteMe.id)}
                  />
                </div>
                <Textarea
                  key={"text" + index}
                  id={abouteMe.id}
                  className="mx-2 mb-2 h-[12rem] w-[34rem] dark:text-white lg:w-[45rem]"
                  defaultValue={abouteMe.text}
                />
              </>
            ))}
            <Button className="mb-12 mt-6" onClick={(e) => addTextarea(e)}>
              Add
            </Button>
          </form>
        )}
        {!edit && (
          <>
            {abouteMe.map((abouteMe: any, index: any) => (
              <p
                className="mb-3"
                key={"text" + index}
                dangerouslySetInnerHTML={{ __html: abouteMe.text }}
              ></p>
            ))}
          </>
        )}
      </div>
    </section>
  );
};

export default About;
