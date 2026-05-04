const features = [
  {
    number: "1",
    title: "Science-backed approach",
    description: "Every diet plan and recipe is developed using the latest nutritional research and evidence-based practices.",
  },
  {
    number: "2",
    title: "Personalized guidance",
    description: "Get recommendations tailored to your specific health goals, dietary restrictions, and lifestyle preferences.",
  },
];

export function FeaturesSection() {
  return (
    <section className="border-y border-border bg-secondary/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Why Choose Us
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Combining innovation, sustainability, and results
          </h2>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.number}
              className="rounded-lg border border-border bg-card p-8"
            >
              <span className="font-serif text-5xl font-bold text-foreground/10">
                {feature.number}
              </span>
              <h3 className="mt-4 font-serif text-xl font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
