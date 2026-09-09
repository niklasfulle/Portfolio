"use client";

import type { SectionName } from "@/lib/types";
import { links } from "@/lib/data";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ActiveSectionContextProviderProps = {
  readonly children: React.ReactNode;
};

type ActiveSectionContextType = {
  activeSection: SectionName;
  setActiveSection: React.Dispatch<React.SetStateAction<SectionName>>;
  timeOfLastClick: number;
  setTimeOfLastClick: React.Dispatch<React.SetStateAction<number>>;
};

export const ActiveSectionContext = createContext<ActiveSectionContextType | null>(null);

function getSectionNameFromHash(hash: string): SectionName | null {
  const link = links.find((item) => item.hash.endsWith(hash));
  return link?.name ?? null;
}

export default function ActiveSectionContextProvider({
  children,
}: ActiveSectionContextProviderProps) {
  const [activeSection, setActiveSection] = useState<SectionName>("Home");
  const [timeOfLastClick, setTimeOfLastClick] = useState(0); // we need to keep track of this to disable the observer temporarily when user clicks on a link

  useEffect(() => {
    const updateFromHash = () => {
      const sectionName = getSectionNameFromHash(globalThis.location.hash);

      if (sectionName !== null) {
        setActiveSection(sectionName);
      }
    };

    updateFromHash();
    globalThis.addEventListener("hashchange", updateFromHash);

    return () => {
      globalThis.removeEventListener("hashchange", updateFromHash);
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      activeSection,
      setActiveSection,
      timeOfLastClick,
      setTimeOfLastClick,
    }),
    [activeSection, timeOfLastClick]
  );

  return (
    <ActiveSectionContext.Provider
      value={contextValue}
    >
      {children}
    </ActiveSectionContext.Provider>
  );
}

export function useActiveSectionContext() {
  const context = useContext(ActiveSectionContext);

  if (context === null) {
    throw new Error("useActiveSectionContext must be used within an ActiveSectionContextProvider");
  }

  return context;
}
