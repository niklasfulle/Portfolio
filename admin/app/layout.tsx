import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portfolio Admin",
  description: "Geschützter Verwaltungsbereich für das Portfolio.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="de"
      suppressHydrationWarning
      className={cn(
        "light:bg-white w-[100%] scroll-smooth text-slate-900 antialiased dark:bg-gray-800",
        inter.className,
      )}
    >
      <body className="relative isolate flex min-h-screen flex-col scroll-smooth bg-transparent text-gray-950 dark:bg-transparent dark:text-gray-50 dark:text-opacity-90">
        {children}
      </body>
    </html>
  );
}
