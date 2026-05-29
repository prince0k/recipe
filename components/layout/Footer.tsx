import React from "react";
import Link from "next/link";
import { PartnerFooter } from "./PartnerFooter";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <span className="font-serif text-2xl md:text-3xl font-bold text-primary flex flex-col line-tight">
              NutriGuide 
              <span className="text-xs md:text-sm font-medium opacity-80 italic -mt-1 tracking-wide">by Stewart Lucas</span>
            </span>
            <p className="text-text-muted text-base max-w-xs">
              Simple recipes for real life. Wholesome food inspiration and budget-friendly home cooking.
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

        <div className="mt-12 border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left max-w-2xl">
            <p className="text-[11px] text-text-muted leading-relaxed">
              <strong>Medical Disclaimer:</strong> The nutritional, recipes, and dietary plan information on NutriGuide by Stewart Lucas is for educational and informational purposes only. It is not intended as medical advice, diagnosis, or treatment. Always consult with your primary healthcare provider or dietitian before initiating any new nutrition program or diet lifestyle changes.
            </p>
          </div>
          <div className="flex space-x-6 flex-shrink-0">
            <a href="https://instagram.com/nutriguide.stewartlucas" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary transition-colors">
              <span className="sr-only">Instagram</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.01 3.71.054 3.139.143 4.596 1.611 4.738 4.73.044.93.054 1.285.054 3.71s-.01 2.784-.054 3.71c-.143 3.14-1.61 4.593-4.73 4.73-.93.043-1.285.054-3.71.054s-2.784-.01-3.71-.054c-3.139-.143-4.596-1.611-4.738-4.73-.044-.93-.054-1.285-.054-3.71s.01-2.784.054-3.71c.143-3.14 1.61-4.592 4.73-4.73.93-.043 1.285-.054 3.71-.054zM12 6.865A5.135 5.135 0 1017.135 12 5.135 5.135 0 0012 6.865zm0 8.468a3.333 3.333 0 110-6.666 3.333 3.333 0 010 6.666zm5.338-9.87a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="https://pinterest.com/nutriguide_stewartlucas" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-primary transition-colors">
              <span className="sr-only">Pinterest</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.965 1.406-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 11.996-5.37 11.996-12s-5.37-12-12-12z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
        
        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} NutriGuide by Stewart Lucas. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
