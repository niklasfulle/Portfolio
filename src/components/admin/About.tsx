"use client";
import React, { FC, useState } from "react";
import { useSectionInView } from "@/lib/hooks";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/ui/Button";
import { Textarea } from "@/ui/Textarea";
import { useRouter } from "next/navigation";
import { shortToast } from "@/lib/helpers/shorter-function";

type AboutMe = {
  id: number;
  text: string;
  order: number;
  visible: boolean;
};

interface Props {
  abouteMe: AboutMe[];
}

const About: FC<Props> = ({ abouteMe }) => {
  const [edit, setEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const save = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const target = e.target as typeof e.target & {
        text1: { value: string };
        text2: { value: string };
        text3: { value: string };
        text4: { value: string };
      };

      const data = {
        text1: target.text1.value,
        text2: target.text2.value,
        text3: target.text3.value,
        text4: target.text4.value,
      };

      console.log(data);

      const res = await fetch("/api/data/about", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.status === 200) {
        shortToast(
          "Success",
          "The texts were updated successfully.",
          "success",
          5000
        );
      }
    } catch (error) {
      console.error(error);
      shortToast(
        "Error",
        "There was an error updating the texts.",
        "error",
        5000
      );
    }

    setIsLoading(false);
    setEdit(false);
    window.location.href = "/admin#about";
    router.refresh();
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
        <>
          <Button
            className="absolute right-2 top-2 min-w-[6rem] bg-gray-800 font-semibold text-white shadow-md  hover:bg-gray-600 dark:text-black dark:hover:bg-gray-400"
            onClick={() => setEdit(false)}
          >
            Close
          </Button>
        </>
      )}
      <div
        ref={ref}
        className="max-w-[45rem] scroll-mt-28 text-center leading-8"
        id="about"
      >
        <SectionHeading>About me</SectionHeading>
        {edit && (
          <form className="mb-12 flex flex-col" onSubmit={(e) => save(e)}>
            {abouteMe.map((abouteMe: any, index: any) => (
              <>
                <div className="flex flex-row items-center justify-between">
                  <h4 className="mx-4 text-left" key={"h4" + index}>
                    Text {abouteMe.id}:
                  </h4>
                </div>
                <div className="flex flex-row">
                  <Textarea
                    key={"text" + index}
                    id={"text" + abouteMe.id}
                    className="mx-2 mb-2 h-[12rem] w-[32rem] dark:text-white lg:w-[45rem]"
                    defaultValue={abouteMe.text}
                  />
                </div>
              </>
            ))}
            <Button
              isLoading={isLoading}
              disabled={isLoading}
              className="mx-auto mt-4 min-w-[10rem] bg-gray-800 font-semibold text-white shadow-md  hover:bg-gray-600 dark:text-black dark:hover:bg-gray-400"
              type="submit"
            >
              Save
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
