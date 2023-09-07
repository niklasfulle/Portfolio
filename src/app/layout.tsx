import React from "react";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Niklas Fulle",
  description: "Portfolio of Niklas Fulle",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("text-slate-900 antialiased bg-black", inter.className)}>
      <body>{children}</body>
    </html>
  );
}
