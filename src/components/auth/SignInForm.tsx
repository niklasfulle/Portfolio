"use client";
import React, { useState } from "react";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { loginWithCredentials } from "@/lib/auth/auth-functions";
import { Eye, EyeOff } from "lucide-react";

const SignInForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <div className="flex h-fit flex-col items-center justify-center rounded-lg bg-white px-6 py-6 dark:bg-gray-700 lg:px-8">
      <div className="flex flex-col items-center justify-center sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-0 text-center text-2xl font-semibold leading-6 tracking-tight text-gray-900 dark:text-white">
          Sign in
        </h2>
      </div>
      <div className="mt-3 sm:mx-auto sm:w-full sm:max-w-sm">
        <form
          className="space-y-6"
          onSubmit={(e) => loginWithCredentials(e, setIsLoading)}
        >
          <div>
            <label
              htmlFor="email"
              className="block pl-2 text-left text-sm font-medium leading-6 text-gray-900 dark:text-white"
            >
              E-Mail
            </label>
            <div className="mt-1">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="px-l block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 transition-all ease-in placeholder:text-gray-400 focus:ring-[#64cfbd] dark:text-white dark:focus:ring-[#906394] dark:focus:ring-offset-slate-700 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="password"
              className="block pl-2 text-left text-sm font-medium leading-6 text-gray-900 dark:text-white"
            >
              Password
            </label>
            <div className="relative mt-1 flex flex-row items-center">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="block w-full rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 transition-all ease-in placeholder:text-gray-400 focus:ring-[#64cfbd] dark:text-white dark:focus:ring-[#906394] dark:focus:ring-offset-slate-700 sm:text-sm sm:leading-6"
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-2">
                {showPassword ? (
                  <EyeOff
                    className="h-5 w-5 cursor-pointer rounded text-sm dark:text-white"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <Eye
                    className="h-5 w-5 cursor-pointer rounded text-sm dark:text-white"
                    onClick={() => setShowPassword(true)}
                  />
                )}
              </div>
            </div>
          </div>
          <div>
            <Button
              isLoading={isLoading}
              disabled={isLoading}
              type="submit"
              className="flex w-full justify-center rounded-md bg-[#64cfbd] px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm transition-all ease-in hover:bg-[#48aa9a] focus:outline-none focus:ring-2 focus:ring-[#64cfbd] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-[#906394] dark:text-white dark:hover:bg-[#bf77c5] dark:hover:text-gray-200 dark:focus:ring-[#bf77c5] dark:focus:ring-offset-slate-700"
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignInForm;
