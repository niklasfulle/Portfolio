import React from "react";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/Providers";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";
import { UserButton } from "@/components/User";
import Socials from "@/components/Socials";
import NameAnimation from "@/components/NameAnimation";
import Header from "@/components/Header";
import Toggels from "@/components/Toggels";
import { getSession } from "next-auth/react";
import { headers } from "next/headers";

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
  const session = await getSession({
    req: {
      headers: Object.fromEntries(headers().entries()),
    },
  });

  return (
    <html
      lang="en"
      className={cn(
        "light:bg-white scroll-smooth text-slate-900 antialiased dark:bg-slate-900",
        inter.className
      )}
    >
      <body className="relative bg-gray-50 pt-28 text-gray-950 dark:bg-gray-900 dark:text-gray-50 dark:text-opacity-90 sm:pt-36">
        <Providers>
          <NameAnimation />
          <Header />
          <UserButton session={session} />
          <Socials />
          {children}
          <Footer />
          <Toggels />
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
