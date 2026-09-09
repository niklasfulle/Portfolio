"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

type ConsentChoice = "accepted" | "rejected" | null;

type CookieConsentContextType = {
  readonly choice: ConsentChoice;
  readonly isBannerOpen: boolean;
  readonly functionalStorageAllowed: boolean;
  readonly saveChoice: (choice: Exclude<ConsentChoice, null>) => void;
  readonly openPreferences: () => void;
};

const CONSENT_COOKIE = "portfolio-cookie-consent";
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

const CookieConsentContext = createContext<CookieConsentContextType | null>(null);

const subscribeToConsentCookie = () => () => undefined;

function readConsentChoice(): ConsentChoice {
  const storedChoice = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${CONSENT_COOKIE}=`))
    ?.split("=")[1];

  return storedChoice === "accepted" || storedChoice === "rejected"
    ? storedChoice
    : null;
}

export default function CookieConsentProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const storedChoice = useSyncExternalStore(
    subscribeToConsentCookie,
    readConsentChoice,
    () => null
  );
  const [savedChoice, setSavedChoice] = useState<ConsentChoice>(null);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const choice = savedChoice ?? storedChoice;
  const isBannerOpen = isPreferencesOpen || choice === null;

  const saveChoice = useCallback((nextChoice: Exclude<ConsentChoice, null>) => {
    document.cookie = `${CONSENT_COOKIE}=${nextChoice}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax`;
    setSavedChoice(nextChoice);
    setIsPreferencesOpen(false);
  }, []);

  const openPreferences = useCallback(() => {
    setIsPreferencesOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      choice,
      isBannerOpen,
      functionalStorageAllowed: choice === "accepted",
      saveChoice,
      openPreferences,
    }),
    [choice, isBannerOpen, openPreferences, saveChoice]
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);

  if (context === null) {
    throw new Error(
      "useCookieConsent must be used within a CookieConsentProvider"
    );
  }

  return context;
}
