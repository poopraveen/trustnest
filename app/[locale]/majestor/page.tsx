import type { Metadata } from "next";
import Hero from "@/components/majestor/home/Hero";
import CollectionsGrid from "@/components/majestor/home/CollectionsGrid";
import FeaturedProducts from "@/components/majestor/home/FeaturedProducts";
import NewsletterSection from "@/components/majestor/home/NewsletterSection";

export const metadata: Metadata = {
  title: "Majestronicz — DIY Electronics Store India",
  description: "ESP32, Arduino, sensors, displays & 600+ components. High-quality DIY electronics delivered across India.",
};

export default function MajestorHome() {
  return (
    <>
      <Hero />
      <CollectionsGrid />
      <FeaturedProducts />
      <NewsletterSection />
    </>
  );
}
