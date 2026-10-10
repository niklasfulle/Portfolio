import type { ReactNode } from "react";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import Background from "@/components/Background";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import Footer from "@/components/Footer";
import Header from "@/components/header";
import Providers from "@/components/Providers";
import MobileMenu from "@/ui/MobileMenu";
import NameAnimation from "@/ui/NameAnimation";
import Socials from "@/ui/Socials";
import Toggels from "@/ui/Toggels";

type PortfolioFrameProps = {
  readonly children: ReactNode;
  readonly publicBaseUrl?: string;
};

export default function PortfolioFrame({ children, publicBaseUrl }: PortfolioFrameProps) {
  return (
    <>
      <Background />
      <div className="relative z-10 flex min-h-screen flex-1 flex-col pt-28 text-gray-950 dark:text-gray-50 dark:text-opacity-90 sm:pt-36">
        <Suspense>
          <Providers>
            <NameAnimation />
            <Header />
            <Socials />
            {children}
            <Footer publicBaseUrl={publicBaseUrl} />
            <Toggels />
            <MobileMenu />
            <CookieConsentBanner />
            <Toaster position="bottom-right" />
          </Providers>
        </Suspense>
      </div>
    </>
  );
}
