import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { StoryScroll } from "@/components/landing/StoryScroll";
import { Services } from "@/components/landing/Services";
import { Pricing } from "@/components/landing/Pricing";
import { Reviews } from "@/components/landing/Reviews";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kora Laundry — Stop Washing. Start Living." },
      { name: "description", content: "Animated story of how Kora picks up, washes, and delivers your laundry — so you can chill. Doorstep pickup, premium care, live tracking." },
      { property: "og:title", content: "Kora Laundry — Stop Washing. Start Living." },
      { property: "og:description", content: "Outsource laundry. Reclaim your weekends. Scroll the story." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <StoryScroll />
      <Services />
      <Pricing />
      <Reviews />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
