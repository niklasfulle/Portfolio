import React, { FC } from "react";

interface FormUploadProps {
  id: string;
  title: string;
  selectedImage?: any;
  setSelectedImage?: any;
  setFile?: any;
}

const FormUpload: FC<FormUploadProps> = ({
  id,
  title,
  selectedImage,
  setSelectedImage,
  setFile,
}) => {
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
            id={id}
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
          <div className="flex aspect-video w-full cursor-pointer items-center justify-center rounded border-2 border-dashed border-black dark:border-white">
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
