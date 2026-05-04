import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-foreground text-background">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=2070"
          alt="Fresh healthy ingredients"
          fill
          className="object-cover opacity-40"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/80 to-foreground/60" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-background/70">
            Science-backed nutrition
          </p>
          <h1 className="mt-4 font-serif text-4xl font-bold leading-tight tracking-tight text-background sm:text-5xl lg:text-6xl text-balance">
            Transform your health with expert guidance
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-background/80 text-pretty">
            Free diet plans, cheat sheets, and recipes designed by nutrition experts. 
            Proven strategies for weight management, PCOS, diabetes, and overall wellness.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/diet-plan"
              className="inline-flex items-center justify-center rounded-md bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-background/90"
            >
              Get Free Diet Plan
            </Link>
            <Link
              href="/recipes"
              className="inline-flex items-center justify-center rounded-md border border-background/30 px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-background/10"
            >
              Browse Recipes
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
