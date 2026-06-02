import { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Stewart Lucas team for collaborations, questions, or just to say hi.",
  alternates: {
    canonical: "https://stewartlucas.com/contact",
  },
  openGraph: {
    title: "Contact Us | NutriGuide",
    description: "Get in touch with the Stewart Lucas team for collaborations, questions, or just to say hi.",
    url: "https://stewartlucas.com/contact",
    images: [
      {
        url: "https://stewartlucas.com/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Contact Us | Stewart Lucas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | NutriGuide",
    description: "Get in touch with the Stewart Lucas team for collaborations, questions, or just to say hi.",
    images: ["https://stewartlucas.com/assets/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function ContactPage() {
  const breadcrumbListSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://stewartlucas.com" },
      { "@type": "ListItem", "position": 2, "name": "Contact", "item": "https://stewartlucas.com/contact" }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListSchema) }}
      />
      <div className="bg-background min-h-screen">
        <section className="w-full py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={[{ label: "Contact" }]} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <span className="text-primary font-bold tracking-widest uppercase text-xs mb-4 block">Get in Touch</span>
            <h1 className="text-5xl md:text-6xl font-bold text-text mb-8">We'd love to hear <br /><span className="text-secondary">from you.</span></h1>
            <p className="text-xl text-text-muted font-serif italic leading-relaxed mb-12">
              Whether you have a question about a recipe, want to collaborate, or just want to share your culinary creations, we're all ears.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center text-primary">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1">Email Us</span>
                  <span className="text-lg font-bold text-text">hello@stewartlucas.com</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center text-secondary">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1">Our Studio</span>
                  <span className="text-lg font-bold text-text">Brooklyn, New York</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] cinematic-shadow border border-border">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text px-1">First Name</label>
                  <input type="text" placeholder="John" className="w-full px-6 py-4 rounded-xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text px-1">Last Name</label>
                  <input type="text" placeholder="Doe" className="w-full px-6 py-4 rounded-xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-text px-1">Email Address</label>
                <input type="email" placeholder="john@example.com" className="w-full px-6 py-4 rounded-xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-text px-1">Subject</label>
                <select className="w-full px-6 py-4 rounded-xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                  <option>General Inquiry</option>
                  <option>Recipe Question</option>
                  <option>Collaboration</option>
                  <option>Media Request</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-text px-1">Message</label>
                <textarea rows={5} placeholder="Tell us more..." className="w-full px-6 py-4 rounded-xl bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"></textarea>
              </div>
              <Button size="lg" className="w-full py-5 rounded-xl shadow-xl">Send Message</Button>
            </form>
          </div>
        </div>
        </div>
      </section>
    </div>
    </>
  );
}
