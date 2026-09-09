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
import CookieConsentBanner from "@/components/CookieConsentBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Niklas Fulle",
  description: "Portfolio of Niklas Fulle",
};

export default async function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html
      lang="de"
      suppressHydrationWarning
      className={cn(
        "light:bg-white w-[100%] scroll-smooth text-slate-900 antialiased dark:bg-gray-800",
        inter.className
      )}
    >
      <body className="relative isolate flex min-h-screen flex-col scroll-smooth bg-transparent pt-28 text-gray-950 dark:bg-transparent dark:text-gray-50 dark:text-opacity-90 sm:pt-36">
        <Background />
        <div className="relative z-10 flex min-h-screen flex-1 flex-col">
          <Suspense>
            <Providers>
              <NameAnimation />
              <Header />
              <Socials />
              {children}
              <Footer />
              <Toggels />
              <MobileMenu />
              <CookieConsentBanner />
              <Toaster position="bottom-right" />
            </Providers>
          </Suspense>
        </div>
      </body>
    </html>
  );
}
