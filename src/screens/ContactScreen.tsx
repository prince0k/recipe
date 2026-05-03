
export default function ContactScreen() {
  return (
    <div className="animate-fade-in min-h-[80vh] flex flex-col items-center justify-center py-20 px-6">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="space-y-8">
           <h1 className="text-6xl font-bold font-serif text-on-surface leading-tight">Get in Touch</h1>
           <p className="text-xl text-on-surface-variant font-serif italic">
             Whether you have a question about a recipe, want to collaborate, or simply wish to say hello, I'd love to hear from you.
           </p>
           
           <div className="space-y-6 pt-8">
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-outline">Email Me</p>
                  <p className="text-lg font-serif">hello@stwartlucas.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-outline">Location</p>
                  <p className="text-lg font-serif">Brooklyn, New York</p>
                </div>
              </div>
           </div>
        </div>

        <div className="bg-surface-container rounded-2xl p-10 border border-outline-variant/30 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-3xl -mr-16 -mt-16"></div>
           <form className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Name</label>
                <input type="text" className="w-full bg-transparent border-0 border-b-2 border-outline-variant py-3 focus:ring-0 focus:border-primary transition-all placeholder:italic" placeholder="Your name" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Email</label>
                <input type="email" className="w-full bg-transparent border-0 border-b-2 border-outline-variant py-3 focus:ring-0 focus:border-primary transition-all placeholder:italic" placeholder="your.email@example.com" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Subject</label>
                <select className="w-full bg-transparent border-0 border-b-2 border-outline-variant py-3 focus:ring-0 focus:border-primary transition-all">
                  <option>Recipe Question</option>
                  <option>Collaboration Inquiry</option>
                  <option>Just Saying Hello</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Message</label>
                <textarea rows={4} className="w-full bg-transparent border-0 border-b-2 border-outline-variant py-3 focus:ring-0 focus:border-primary transition-all placeholder:italic resize-none" placeholder="What's on your mind?"></textarea>
              </div>

              <button className="w-full bg-secondary text-on-secondary py-4 rounded-md font-bold uppercase tracking-widest text-xs hover:bg-on-secondary-container hover:-translate-y-1 transition-all shadow-lg active:scale-95">
                Send Message
              </button>
           </form>
        </div>
      </div>
    </div>
  );
}
