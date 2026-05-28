"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { PersonalisedWizard } from "@/components/content/PersonalisedWizard";

interface Plan {
  id: string;
  createdAt: string;
  status: string;
  contentTitle: string;
}

interface PersonalizedLandingClientProps {
  session: any;
  defaultDietPlan: any;
  existingPlans: Plan[];
}

export function PersonalizedLandingClient({
  session,
  defaultDietPlan,
  existingPlans
}: PersonalizedLandingClientProps) {
  const [showWizard, setShowWizard] = useState(false);

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Header */}
      <section className="relative bg-surface py-20 border-b border-border overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-emerald-600 font-bold tracking-widest uppercase text-xs mb-4 block">
            AI-Powered & Science-Backed
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-text mb-6">
            Your Personalised Meal Plan <br />
            <span className="text-primary italic font-serif font-normal">in under 60 seconds.</span>
          </h1>
          <p className="text-xl text-text-muted font-serif italic max-w-2xl mx-auto mb-8">
            Tell us your health goals, dietary preferences, and daily struggles. Our advanced AI system constructs a complete 7-day custom-configured blueprint.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
            {session ? (
              defaultDietPlan ? (
                <Button 
                  size="lg" 
                  className="px-8 py-4 rounded-xl shadow-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition border-none"
                  onClick={() => setShowWizard(true)}
                >
                  Start Assessment Quiz &rarr;
                </Button>
              ) : (
                <p className="text-sm text-text-muted">Personalized planner setup is incomplete. Check back later.</p>
              )
            ) : (
              <Link href="/signup?redirect=/personalized">
                <Button 
                  size="lg" 
                  className="px-8 py-4 rounded-xl shadow-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition border-none"
                >
                  Create Free Account to Start &rarr;
                </Button>
              </Link>
            )}
            <Link href="#how-it-works" className="text-sm font-bold text-text-muted hover:text-primary transition">
              Learn How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* User dashboard / plans section */}
      {session && existingPlans.length > 0 && (
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[2.5rem] border border-border p-8 md:p-12 cinematic-shadow">
            <h2 className="text-2xl font-bold text-text font-serif mb-6 flex items-center">
              <span className="mr-2">📋</span> Your Existing Custom Meal Plans
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {existingPlans.map((plan) => (
                <div key={plan.id} className="p-6 rounded-2xl bg-surface border border-border hover:border-primary/30 transition flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-text text-lg">{plan.contentTitle}</h3>
                    <p className="text-xs text-text-muted mt-1">Generated: {new Date(plan.createdAt).toLocaleDateString()}</p>
                    <span className={`inline-block mt-3 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${plan.status === "SENT" || plan.status === "PENDING" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
                      {plan.status}
                    </span>
                  </div>
                  <Link href={`/personalized/${plan.id}`}>
                    <Button variant="outline" className="px-5 py-2.5 rounded-xl text-sm font-bold">
                      Open Plan
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it Works / Custom Mockup */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Custom Blueprint Mockup Card */}
          <div className="space-y-6">
            <span className="text-xs font-bold text-primary uppercase tracking-widest block">Premium Preview</span>
            <h2 className="text-4xl font-bold text-text leading-tight">
              A Complete 7-Day <br />
              <span className="text-emerald-600 italic font-serif font-normal">Transformation Blueprint</span>
            </h2>
            <p className="text-lg text-text-muted leading-relaxed">
              We do not believe in generic suggestions. Every plan is generated with specific calorie targets, macro allocations, exact cooking times, portion rules, and batch-prepping guides.
            </p>

            <div className="space-y-4 pt-4 text-sm">
              <div className="flex gap-4 items-start">
                <span className="w-6 h-6 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">✓</span>
                <div>
                  <strong className="text-text">Craving & Appetite SOS:</strong> Swaps and tips engineered to control specific snacking moments.
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <span className="w-6 h-6 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">✓</span>
                <div>
                  <strong className="text-text">Sunday Prep Stack:</strong> Simple batch-cook blueprints to minimize weekday cooking stress.
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <span className="w-6 h-6 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">✓</span>
                <div>
                  <strong className="text-text">Milestone Signals:</strong> Exactly what physical check-ins to monitor on Day 3, 5, and 7.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 text-white rounded-[3rem] p-8 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Header branding */}
            <div className="flex justify-between items-center pb-6 border-b border-white/10 mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">NutriGuide AI Blueprint</span>
                <h4 className="font-serif italic text-lg font-bold">Preview Edition</h4>
              </div>
              <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-white/80 font-bold">Day 1 Theme: Strong Start</span>
            </div>

            {/* Custom Layout preview */}
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-4">
                <div className="text-xs uppercase text-emerald-400 font-bold tracking-wider mt-1 w-16">Breakfast</div>
                <div>
                  <h5 className="font-bold text-white text-base">Zesty Greens Power Smoothie</h5>
                  <p className="text-xs text-white/55 mt-1 italic">Blended raw spinach, ginger root, lemon zest, whey protein, and chilled almond base.</p>
                  <div className="flex gap-3 text-[10px] text-emerald-400 font-bold mt-2.5">
                    <span>10 Min Prep</span>
                    <span>•</span>
                    <span>340 Calories</span>
                    <span>•</span>
                    <span>[Gut Happy]</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-4">
                <div className="text-xs uppercase text-emerald-400 font-bold tracking-wider mt-1 w-16">Lunch</div>
                <div>
                  <h5 className="font-bold text-white text-base">Herb-Kissed Chicken Avocado Bowl</h5>
                  <p className="text-xs text-white/55 mt-1 italic">Vibrant roasted chicken breast sliced over crisp romaine, cucumber ribbons, and diced avocado.</p>
                  <div className="flex gap-3 text-[10px] text-emerald-400 font-bold mt-2.5">
                    <span>15 Min Prep</span>
                    <span>•</span>
                    <span>520 Calories</span>
                    <span>•</span>
                    <span>[Low-Carb]</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-4">
                <div className="text-xs uppercase text-emerald-400 font-bold tracking-wider mt-1 w-16">Dinner</div>
                <div>
                  <h5 className="font-bold text-white text-base">Pan-Seared Salmon over Asparagus</h5>
                  <p className="text-xs text-white/55 mt-1 italic">Crispy salmon fillet cooked in light olive oil, served over tender steamed asparagus spears.</p>
                  <div className="flex gap-3 text-[10px] text-emerald-400 font-bold mt-2.5">
                    <span>20 Min Cook</span>
                    <span>•</span>
                    <span>610 Calories</span>
                    <span>•</span>
                    <span>[Anti-Inflammatory]</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Grid */}
      <section className="py-24 bg-surface border-t border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text font-serif">Why Personalize?</h2>
            <p className="text-text-muted mt-2">The difference between a generic template and an custom protocol.</p>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-border overflow-hidden cinematic-shadow">
            <table className="min-w-full divide-y divide-border text-left">
              <thead className="bg-text text-white">
                <tr>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-white">Feature</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-white">Standard Diet Plan</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-white">Personalised AI Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                <tr>
                  <td className="px-6 py-4 font-bold text-text">Dietary Restrictions</td>
                  <td className="px-6 py-4 text-text-muted">Standard options only</td>
                  <td className="px-6 py-4 text-emerald-600 font-semibold flex items-center gap-1.5">
                    <span>✓</span> 100% Customized (Keto, GF, Vegan, etc.)
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold text-text">Struggle Interventions</td>
                  <td className="px-6 py-4 text-text-muted">None</td>
                  <td className="px-6 py-4 text-emerald-600 font-semibold flex items-center gap-1.5">
                    <span>✓</span> Satiety SOS, energy trackers, prep hacks
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold text-text">Time Parameters</td>
                  <td className="px-6 py-4 text-text-muted">Fixed prep times</td>
                  <td className="px-6 py-4 text-emerald-600 font-semibold flex items-center gap-1.5">
                    <span>✓</span> Tuned to your schedule (e.g. Under 15m)
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold text-text">Citations & Trust</td>
                  <td className="px-6 py-4 text-text-muted">Generic advice</td>
                  <td className="px-6 py-4 text-emerald-600 font-semibold flex items-center gap-1.5">
                    <span>✓</span> Science-backed, reviewed by Stewart Lucas
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Launcher Modal */}
      {showWizard && defaultDietPlan && (
        <PersonalisedWizard 
          isOpen={showWizard} 
          onClose={() => setShowWizard(false)} 
          content={defaultDietPlan}
        />
      )}
    </div>
  );
}
