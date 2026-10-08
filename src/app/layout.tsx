import React from "react";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import PortfolioFrame from "@/components/PortfolioFrame";
import { cn } from "@/lib/utils";
import { structuredData } from "@/lib/structured-data";

const inter = Inter({ subsets: ["latin"] });

const themeInitScript = `
  (() => {
    try {
      const consent = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith('portfolio-cookie-consent='))
        ?.split('=')[1];
      const theme = consent === 'accepted' && localStorage.getItem('theme') === 'dark'
        ? 'dark'
        : 'light';
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.documentElement.classList.toggle('light', theme === 'light');
    } catch {
      document.documentElement.classList.add('light');
    }
  })();
`;

export const metadata: Metadata = {
  title: "Niklas Fulle | Softwareentwickler & DevOps",
  description:
    "Portfolio von Niklas Fulle: Softwareentwicklung, DevOps, Projekte und technische Fähigkeiten.",
  keywords: [
    "Niklas Fulle",
    "Softwareentwickler",
    "DevOps",
    "TypeScript",
    "Next.js",
    "Docker",
  ],
  robots: {
    index: true,
    follow: true,
  },
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
      <body className="relative isolate flex min-h-screen flex-col scroll-smooth bg-transparent text-gray-950 dark:bg-transparent dark:text-gray-50 dark:text-opacity-90">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <PortfolioFrame>{children}</PortfolioFrame>
      </body>
    </html>
  );
}
