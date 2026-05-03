
export default function AboutScreen() {
  return (
    <div className="animate-fade-in">
       <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-20 flex flex-col md:flex-row gap-16 items-center">
          <div className="w-full md:w-1/2 aspect-square rounded-2xl overflow-hidden shadow-2xl relative">
            <img 
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop" 
              className="absolute inset-0 w-full h-full object-cover" 
              alt="Kitchen Atmosphere" 
            />
          </div>
          <div className="w-full md:w-1/2 space-y-8">
            <span className="text-xs font-bold text-secondary uppercase tracking-[0.3em]">Behind the Recipes</span>
            <h1 className="text-5xl font-bold font-serif text-on-surface leading-tight italic">Welcome to my kitchen.</h1>
            <p className="text-xl text-on-surface-variant leading-relaxed">
              I believe that cooking shouldn't be an intimidating performance. It's a daily ritual, a tactile connection to the seasons, and the simplest way to gather the people you love around a single table.
            </p>
            <div className="pt-8">
              <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1974&auto=format&fit=crop" className="w-16 h-16 rounded-full border-2 border-primary grayscale hover:grayscale-0 transition-all cursor-pointer" alt="Stwart" />
              <p className="mt-4 font-serif text-lg italic text-secondary">- Stwart Lucas</p>
            </div>
          </div>
       </section>

       <section className="bg-surface-container-low py-24">
          <div className="max-w-2xl mx-auto px-6 text-center space-y-8">
            <h2 className="text-4xl font-serif text-primary italic leading-tight">A Return to Simplicity</h2>
            <div className="h-px bg-outline-variant w-16 mx-auto"></div>
            <div className="space-y-6 text-left text-on-surface-variant leading-relaxed text-lg">
              <p>My journey didn't start in a culinary institute. It started on a stool next to the stove, watching butter brown and listening to onions sizzle. For years, I chased complicated techniques, thinking that complexity equated to quality.</p>
              <p>But over time, I found myself returning to the basics. The perfect roast chicken. A deeply savory tomato sauce built from three ingredients. I realized that the true artistry of home cooking lies in restraint—allowing high-quality, seasonal ingredients to speak for themselves.</p>
            </div>
          </div>
       </section>

       <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-24">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4 p-8 bg-surface rounded-2xl border border-outline-variant/30 shadow-sm transition-transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-serif italic text-2xl">01</span>
              </div>
              <h3 className="text-2xl font-serif text-on-surface">Ingredient First</h3>
              <p className="text-on-surface-variant">Sourcing matters. We prioritize seasonal, local produce to ensure maximum flavor with minimal manipulation.</p>
            </div>

            <div className="space-y-4 p-8 bg-surface rounded-2xl border border-outline-variant/30 shadow-sm transition-transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-serif italic text-2xl">02</span>
              </div>
              <h3 className="text-2xl font-serif text-on-surface">Tactile Process</h3>
              <p className="text-on-surface-variant">Embracing the sensory experience of cooking. Smelling the spices bloom, feeling the dough yield.</p>
            </div>

            <div className="space-y-4 p-8 bg-surface rounded-2xl border border-outline-variant/30 shadow-sm transition-transform hover:-translate-y-2">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-serif italic text-2xl">03</span>
              </div>
              <h3 className="text-2xl font-serif text-on-surface">The Atmosphere</h3>
              <p className="text-on-surface-variant">Food tastes better in the right setting. We curate recipes designed for specific moods and moments.</p>
            </div>
         </div>
       </section>
    </div>
  );
}
