import { createFileRoute, redirect } from "@tanstack/react-router";

import { Header } from "@/components/header";
import { HeroSection } from "@/components/landing/hero-section";
import { isTauri } from "@/lib/tauri";

const Landing = () => {
  return (
    <div className="relative flex flex-col">
      <Header />
      <HeroSection />
    </div>
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
