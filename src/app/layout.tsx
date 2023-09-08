import React from "react";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Niklas Fulle",
  description: "Portfolio of Niklas Fulle",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-gray-50 text-gray-950 relative pt-28 sm:pt-36 dark:bg-gray-900 dark:text-gray-50 dark:text-opacity-90">
        <div className="bg-[#f1dcc8] absolute top-[-6rem] -z-20 right-[11rem] h-[31.25rem] w-[31.25rem] rounded-full blur-[12rem] sm:w-[68.75rem] dark:bg-[#946263]"></div>
        <div className="bg-[#cebbf1] absolute top-[-1rem] -z-10 left-[-35rem] h-[31.25rem] w-[50rem] rounded-full blur-[12rem] sm:w-[68.75rem] md:left-[-33rem] lg:left-[-28rem] xl:left-[-15rem] 2xl:left-[-5rem] dark:bg-[#639463]"></div>
        <div className="bg-[#a8b1da] absolute top-[23rem] -z-20 right-[11rem] h-[31.25rem] w-[31.25rem] rounded-full blur-[12rem] sm:w-[68.75rem] dark:bg-[#627d94]"></div>
        <div className="bg-[#bbf1d3] absolute top-[26rem] -z-10 left-[-35rem] h-[31.25rem] w-[50rem] rounded-full blur-[12rem] sm:w-[68.75rem] md:left-[-33rem] lg:left-[-28rem] xl:left-[-15rem] 2xl:left-[-5rem] dark:bg-[#948b63]"></div>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
