import React, { Suspense } from "react";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/Providers";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";
import Socials from "@/ui/Socials";
import NameAnimation from "@/ui/NameAnimation";
import Toggels from "@/ui/Toggels";
import Header from "@/components/header";
import Background from "@/components/Background";
import MobileMenu from "@/components/ui/MobileMenu";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Niklas Fulle",
  description: "Portfolio of Niklas Fulle",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "light:bg-white w-[100%] scroll-smooth text-slate-900 antialiased dark:bg-gray-800",
        inter.className
      )}
    >
      <body className="relative scroll-smooth bg-gray-50 pt-28 text-gray-950 dark:bg-gray-900 dark:text-gray-50 dark:text-opacity-90 sm:pt-36">
        <Providers>
          <Suspense>
            <NameAnimation />
            <Header />
            <Socials />
            {children}
            <Footer />
            <Toggels />
            <MobileMenu />
            <Toaster position="bottom-right" />
            <Background />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
