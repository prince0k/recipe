import { RECIPES, CATEGORIES } from '../constants';
import RecipeCard from '../components/RecipeCard';
import { Search, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

export default function RecipeListingScreen() {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  
  useEffect(() => {
    const query = searchParams.get('search');
    if (query) setSearchTerm(query);
  }, [searchParams]);

  const currentCategory = CATEGORIES.find(c => c.id === categoryId);
  const filteredRecipes = RECIPES.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryId ? r.category.toLowerCase() === currentCategory?.name.split(' ')[0].toLowerCase() || r.category.toLowerCase() === categoryId.toLowerCase() : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fade-in min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16">
        <header className="mb-16">
          <h1 className="text-6xl font-bold font-serif text-on-surface mb-4 leading-tight">
            {currentCategory ? currentCategory.name : 'The Recipe Archive'}
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl font-serif italic">
            {currentCategory ? currentCategory.description : 'A curated collection of comforting, tactile meals designed for the home kitchen.'}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-12">
            <div className="sticky top-32 space-y-12">
              <section className="space-y-6">
                <h3 className="text-xs font-bold text-on-surface uppercase tracking-[0.2em]">Dietary Preferences</h3>
                <div className="space-y-4">
                  {['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Gluten-Free'].map(pref => (
                    <label key={pref} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded-full border-2 border-outline-variant group-hover:border-primary transition-all"></div>
                      <span className="text-on-surface-variant group-hover:text-primary transition-colors">{pref}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-xs font-bold text-on-surface uppercase tracking-[0.2em]">Cooking Time</h3>
                <div className="space-y-4">
                  {['Under 30 mins', '30 - 60 mins', 'Over 1 hour'].map(time => (
                    <label key={time} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded-full border-2 border-outline-variant group-hover:border-primary transition-all"></div>
                      <span className="text-on-surface-variant group-hover:text-primary transition-colors">{time}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-xs font-bold text-on-surface uppercase tracking-[0.2em]">Calories</h3>
                <input type="range" className="w-full h-1 bg-surface-variant appearance-none accent-primary rounded-full" />
                <div className="flex justify-between text-[10px] uppercase font-bold text-outline">
                  <span>0 kcal</span>
                  <span>1500+ kcal</span>
                </div>
              </section>
            </div>
          </aside>

          {/* Main Area */}
          <div className="lg:col-span-9 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center pb-6 border-b border-outline-variant/30 gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-outline-variant" size={20} />
                <input 
                  type="text" 
                  placeholder="Search recipes..."
                  className="w-full bg-transparent border-0 border-b border-outline-variant pl-8 py-2 focus:ring-0 focus:border-primary placeholder:italic"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-widest text-outline">Sort By:</span>
                <button className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-md hover:bg-surface-container-high transition-colors text-sm font-medium">
                  Newest <ChevronDown size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {filteredRecipes.length > 0 ? (
                 filteredRecipes.map(recipe => (
                   <RecipeCard key={recipe.id} recipe={recipe} />
                 ))
               ) : (
                 <div className="col-span-full py-20 text-center text-xl font-serif italic opacity-50">
                    No recipes found for your selection.
                 </div>
               )}
               {/* Just duplicate some to fill space if not filtering */}
               {!categoryId && !searchTerm && [...RECIPES, ...RECIPES].slice(0, 8).map((recipe, idx) => (
                 <RecipeCard key={`${recipe.id}-${idx}`} recipe={recipe} />
               ))}
            </div>
            
            <div className="pt-12 flex justify-center">
              <button className="bg-surface-container-high border border-outline-variant/30 px-8 py-3 rounded-full hover:bg-surface-container-highest transition-all font-bold uppercase tracking-widest text-xs flex items-center gap-2 group">
                Load More Recipes <ChevronDown size={18} className="group-hover:translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
