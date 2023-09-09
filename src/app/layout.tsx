import React from "react";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import Providers from "@/components/Providers";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";
import UserButton from "@/components/User";
import ThemeSwitch from "@/components/ThemeSwitch";
import Socials from "@/components/Socials";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Niklas Fulle",
  description: "Portfolio of Niklas Fulle",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "light:bg-white scroll-smooth text-slate-900 antialiased dark:bg-slate-900",
        inter.className
      )}
    >
      <body className="relative bg-gray-50 pt-28 text-gray-950 dark:bg-gray-900 dark:text-gray-50 dark:text-opacity-90 sm:pt-36">
        <div className="absolute right-[-8rem] top-[-6rem] -z-20 h-[31.25rem] w-[31.25rem] rounded-full bg-[#f1dcc8] blur-[12rem] dark:bg-[#946263] sm:w-[68.75rem]"></div>
        <div className="absolute left-[-30rem] top-[-1rem] -z-10 h-[31.25rem] w-[50rem] rounded-full bg-[#cebbf1] blur-[12rem] dark:bg-[#639463] sm:w-[68.75rem]"></div>
        <div className="absolute right-[-5rem] top-[23rem] -z-20 h-[31.25rem] w-[31.25rem] rounded-full bg-[#a8b1da] blur-[12rem] dark:bg-[#627d94] sm:w-[68.75rem]"></div>
        <div className="absolute left-[-35rem] top-[26rem] -z-10 h-[31.25rem] w-[50rem] rounded-full bg-[#bbf1d3] blur-[12rem] dark:bg-[#948b63] sm:w-[68.75rem] "></div>
        <Providers>
          <Header />
          <UserButton />
          <Socials />
          {children}
          <Footer />
          <Toaster position="top-right" />
          <ThemeSwitch />
        </Providers>
      </body>
    </html>
  );
}
