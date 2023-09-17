import React, { FC, useState } from "react";
import { Button } from "./Button";

interface FormUploadProps {
  id: string;
  title: string;
  image?: string;
}

const FormUpload: FC<FormUploadProps> = ({ id, title, image }) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>(image || "");
  const [file, setFile] = useState<File>();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    /*if (!file) return;

    try {
      const data = new FormData();
      data.set("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      // handle the error
      if (!res.ok) throw new Error(await res.text());
    } catch (e: any) {
      // Handle errors here
      console.error(e);
    }*/
    setUploading(false);
  };

  return (
    <div className="mb-2.5">
      <label
        htmlFor={id}
        className="block pl-2 text-left text-sm font-medium leading-6 text-gray-900 dark:text-white"
      >
        {title}
      </label>
      <div className="mb-4 mt-0.5">
        <label>
          <input
            type="file"
            hidden
            onChange={({ target }) => {
              if (target.files) {
                const file = target.files[0];
                setSelectedImage(URL.createObjectURL(file));
                setFile(file);
              }
            }}
          />
          <div className="flex aspect-video w-full cursor-pointer items-center justify-center rounded border-2 border-dashed">
            {selectedImage ? (
              <img src={selectedImage} alt="" className="aspect-video w-72" />
            ) : (
              <span>Select Image</span>
            )}
          </div>
        </label>
      </div>
    </div>
  );
};

export default FormUpload;
