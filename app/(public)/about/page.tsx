import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Stwart Lucas | Home Cooking Simplified",
  description: "The story behind Stwart Lucas - a premium food blog dedicated to cinematic, budget-friendly home cooking.",
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
              "I believe that every meal shared at home is an opportunity to create a cinematic memory, regardless of your budget or skill level."
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative h-[700px] rounded-[3.5rem] overflow-hidden cinematic-shadow">
            <Image 
              src="/assets/hero.png" 
              alt="Stwart Lucas Kitchen" 
              fill 
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-bold text-text mb-6">Simple, Honest, & Moody.</h2>
              <p className="text-lg text-text-muted leading-relaxed mb-6">
                Stwart Lucas started in a small kitchen with a big dream: to make home cooking feel as beautiful as it tastes. We focus on real ingredients, simple techniques, and the moody, cinematic lighting that makes every dish look like a piece of art.
              </p>
              <p className="text-lg text-text-muted leading-relaxed">
                Our mission is to empower you to cook delicious, healthy, and budget-friendly meals without the stress. From 15-minute weeknight pasta to slow-cooked Sunday roasts, we're here to guide you every step of the way.
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
              <p className="text-text-muted font-bold">— Stwart Lucas</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary text-white rounded-[4rem] mx-4 lg:mx-8 mb-24 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <Image src="/assets/hero.png" alt="Background" fill className="object-cover" sizes="100vw" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Join Our Community</h2>
          <p className="text-xl text-white/80 mb-12 leading-relaxed">
            Get weekly recipes, kitchen tips, and cinematic inspiration delivered straight to your inbox. No fluff, just good food.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="px-8 py-4 rounded-2xl bg-white text-text w-full sm:w-80 focus:outline-none"
              suppressHydrationWarning
            />
            <button 
              className="px-10 py-4 rounded-2xl bg-accent text-text font-bold shadow-xl hover:scale-105 transition-transform"
              suppressHydrationWarning
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
