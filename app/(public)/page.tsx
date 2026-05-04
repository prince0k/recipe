import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white pb-16 pt-24 sm:pb-24 sm:pt-32">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=2070"
            alt="Healthy food background"
            fill
            sizes="100vw"
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl font-serif">
            Free Diet Plans & Recipes <br className="hidden sm:block" />
            <span className="text-[#10b981]">for Real Health Results</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300">
            Backed by science, designed for life. Download cheat sheets and diet plans to manage weight, PCOS, diabetes, and more.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/diet-plan">
              <Button size="lg" className="bg-[#10b981] text-white hover:bg-[#059669]">
                Get a Free Diet Plan
              </Button>
            </Link>
            <Link href="/recipes">
              <Button size="lg" variant="ghost" className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                Browse Recipes
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl text-center mb-16 font-serif">
          What are you looking for?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Diet Plans", desc: "Structured meal plans for specific health goals.", href: "/diet-plan", icon: "📋" },
            { title: "Healthy Recipes", desc: "Delicious, nutritious meals that are easy to make.", href: "/recipes", icon: "🥗" },
            { title: "Cheat Sheets", desc: "Quick PDF guides for grocery shopping and macros.", href: "/cheat-sheets", icon: "📄" },
          ].map((cat) => (
            <Link key={cat.title} href={cat.href} className="block group">
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:border-[#10b981]/30">
                <div className="text-4xl mb-4">{cat.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif group-hover:text-[#10b981] transition-colors">{cat.title}</h3>
                <p className="text-gray-500">{cat.desc}</p>
                <div className="mt-6 flex items-center text-[#10b981] font-medium text-sm">
                  Explore <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Lead Gen CTA */}
      <div className="bg-[#f8fafc] border-y border-gray-200 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between">
          <div className="text-center lg:text-left mb-8 lg:mb-0">
            <h2 className="text-3xl font-extrabold text-gray-900 font-serif">Ready to start your health journey?</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl">Join thousands getting weekly nutrition tips, free meal plans, and exclusive healthy recipes straight to their inbox.</p>
          </div>
          <Link href="/signup">
            <Button size="lg" className="px-8 py-4 text-lg shadow-lg">Create Free Account</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
