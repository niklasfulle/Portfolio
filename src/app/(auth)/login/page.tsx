"use client";
import SignInForm from "@/components/auth/SignInForm";

export default function Home() {
  return (
    <main className="flex h-[76vh] flex-col items-center px-4">
      <SignInForm />
    </main>
  );
}
