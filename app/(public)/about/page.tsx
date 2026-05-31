import Image from "next/image";
import { Metadata } from "next";
import { EmailCaptureForm } from "@/components/ui/EmailCaptureForm";

export const metadata: Metadata = {
  title: "Stewart Lucas | Healthy Home Cooking & Nutrition",
  description: "The story behind Stewart Lucas - a premium food blog dedicated to cinematic, budget-friendly home cooking.",
  alternates: {
    canonical: "https://stewartlucas.com/about",
  },
  openGraph: {
    title: "Stewart Lucas | Healthy Home Cooking & Nutrition",
    description: "The story behind Stewart Lucas - a premium food blog dedicated to cinematic, budget-friendly home cooking.",
    url: "https://stewartlucas.com/about",
    images: [
      {
        url: "https://stewartlucas.com/assets/stewart_lucas.webp",
        width: 1200,
        height: 630,
        alt: "About Stewart Lucas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stewart Lucas | Healthy Home Cooking & Nutrition",
    description: "The story behind Stewart Lucas - a premium food blog dedicated to cinematic, budget-friendly home cooking.",
    images: ["https://stewartlucas.com/assets/stewart_lucas.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen">
      <section className="relative py-24 bg-surface overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-primary font-bold tracking-widest uppercase text-xs mb-4 block">Our Story</span>
            <h1 className="text-5xl md:text-6xl font-bold text-text mb-8">Home Cooking <br /><span className="text-primary">for Everyone.</span></h1>
            <p className="text-xl text-text-muted font-serif italic leading-relaxed">
              "I believe that every meal shared at home is an opportunity to create a lasting memory, regardless of your budget or skill level."
            </p>
          </div>
        </div>
      </section>

      <section className="w-full py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative h-[700px] rounded-[3.5rem] overflow-hidden cinematic-shadow">
            <Image 
              src="/assets/stewart_lucas.webp" 
              alt="Stewart Lucas Kitchen" 
              fill 
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-bold text-text mb-6">Simple, Honest, & Science-Backed.</h2>
              <p className="text-lg text-text-muted leading-relaxed mb-6">
                Stewart Lucas is a Certified Nutritionist and culinary consultant with over a decade of clinical experience. After years of working with clients to navigate insulin resistance, hormone balance, and sustainable wellness, Stewart founded NutriGuide to bridge the gap between science-backed diet plans and beautiful, easy home cooking.
              </p>
              <p className="text-lg text-text-muted leading-relaxed">
                Our mission is to empower you to cook meals that are not only nutritionally optimized for wellness but also simple, affordable, and delicious. From 15-minute blood-sugar-balancing quick fixes to slow-cooked Sunday feasts, every recipe is crafted to feed both your body and your soul.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8">
              <div className="p-8 bg-surface rounded-[2rem] border border-border">
                <span className="block text-4xl font-bold text-primary mb-2">120+</span>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Unique Recipes</span>
              </div>
              <div className="p-8 bg-surface rounded-[2rem] border border-border">
                <span className="block text-4xl font-bold text-olive mb-2">50k</span>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Monthly Readers</span>
              </div>
            </div>

            <div className="pt-10">
              <h3 className="text-xl font-bold text-text mb-4 font-serif italic">"Cooking is the ultimate act of love—for yourself and those around you."</h3>
              <p className="text-text-muted font-bold">— Stewart Lucas</p>
            </div>
          </div>
        </div>
        </div>
      </section>

      <section className="py-24 bg-primary text-white rounded-[4rem] mx-4 lg:mx-8 mb-24 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <Image src="/assets/hero.webp" alt="Background" fill className="object-cover" sizes="100vw" />
        </div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <EmailCaptureForm
            source="about"
            heading="Join Our Community"
            subheading="Get weekly recipes, kitchen tips, and cinematic inspiration delivered straight to your inbox. No fluff, just good food."
            buttonText="Subscribe →"
            freebie="newsletter"
          />
        </div>
      </section>
    </div>
  );
}
