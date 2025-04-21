import { createFileRoute, redirect } from "@tanstack/react-router";

import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { isTauri } from "@/lib/tauri";

const Landing = () => {
  return (
    <>
      <Header />
      <HeroSection />
    </>
  );
};

export const Route = createFileRoute("/")({
  component: Landing,
  beforeLoad: async () => {
    if (isTauri) {
      throw redirect({
        to: "/library",
      });
    }
  },
});
