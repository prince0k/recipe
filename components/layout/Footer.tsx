import React from "react";
import Link from "next/link";
import { PartnerFooter } from "./PartnerFooter";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <span className="font-serif text-3xl font-bold text-primary">Stwart Lucas</span>
            <p className="text-text-muted text-base max-w-xs">
              Simple recipes for real life. Moody, cinematic food inspiration and budget-friendly home cooking.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-text tracking-wider uppercase font-serif">Explore</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/recipes" className="text-base text-text-muted hover:text-primary transition-colors">
                      Recipes
                    </Link>
                  </li>
                  <li>
                    <Link href="/diet-plan" className="text-base text-text-muted hover:text-primary transition-colors">
                      Diet Plans
                    </Link>
                  </li>
                  <li>
                    <Link href="/cheat-sheets" className="text-base text-text-muted hover:text-primary transition-colors">
                      Cheat Sheets
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-text tracking-wider uppercase font-serif">Company</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/about" className="text-base text-text-muted hover:text-primary transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-base text-text-muted hover:text-primary transition-colors">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="text-base text-text-muted hover:text-primary transition-colors">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy-policy" className="text-base text-text-muted hover:text-primary transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <PartnerFooter />

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-base text-text-muted xl:text-center">
            &copy; {new Date().getFullYear()} Stwart Lucas. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
