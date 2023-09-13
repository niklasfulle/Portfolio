"use client";
import React, { FC } from "react";
import Link from "next/link";

interface Props {
  session?: any;
}

const LoginButton: FC<Props> = ({ session }) => {
  return (
    <div className="fixed right-6 top-6 flex h-[3.25rem] w-[3.25rem] ">
      <Link
        href="/login"
        className="h-[3.25rem] w-[3.25rem] hover:cursor-auto"
      ></Link>
    </div>
  );
};

export default LoginButton;
