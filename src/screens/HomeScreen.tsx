import { RECIPES, CATEGORIES } from '../constants';
import RecipeCard from '../components/RecipeCard';
import { Search, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function HomeScreen() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const featured = RECIPES.find(r => r.isFeatured) || RECIPES[0];
  const trending = RECIPES.filter(r => r.isTrending);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/recipes?search=${encodeURIComponent(searchValue)}`);
    } else {
      navigate('/recipes');
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold font-serif text-primary leading-[1.1]">
                Simple Recipes for Real Life
              </h1>
              <p className="text-lg text-on-surface-variant max-w-md leading-relaxed">
                Discover thoughtfully crafted, wholesome meals that fit into your busy schedule without compromising on flavor or budget.
              </p>
            </div>

            <form onSubmit={handleSearch} className="relative group max-w-lg">
              <div className="flex items-center bg-surface-container rounded-lg p-2 shadow-sm border border-outline-variant focus-within:border-primary transition-colors">
                <Search className="text-outline ml-3" size={20} />
                <input 
                  type="text" 
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Find a recipe or ingredient..."
                  className="bg-transparent border-none focus:ring-0 flex-grow px-4 outline-none text-on-surface"
                />
                <button type="submit" className="bg-secondary text-on-secondary px-6 py-3 rounded-md hover:bg-on-secondary-container transition-colors shadow-sm flex items-center gap-2 font-semibold whitespace-nowrap">
                  <span>Explore Recipes</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>

            <div className="flex items-center gap-4 text-xs font-semibold tracking-wider uppercase text-outline">
              <span>Popular:</span>
              <div className="flex gap-2">
                <span className="bg-surface-container-high px-3 py-1 rounded-full border border-outline-variant text-on-surface-variant">Autumn Soups</span>
                <span className="bg-surface-container-high px-3 py-1 rounded-full border border-outline-variant text-on-surface-variant">One-Pan Dinners</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 grid-rows-2 gap-4 aspect-[4/3] rounded-2xl overflow-hidden">
             <div className="col-span-2 row-span-1">
                <img src={featured.image} className="w-full h-full object-cover" alt="Hero Featured" />
             </div>
             <div className="col-span-1 row-span-1">
                <img src="https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1935&auto=format&fit=crop" className="w-full h-full object-cover" alt="Ingredients" />
             </div>
             <div className="col-span-1 row-span-1">
                <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" alt="Cooking" />
             </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 border-t border-outline-variant/30">
        <h2 className="text-4xl font-serif text-primary mb-8">How are you cooking today?</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {CATEGORIES.map((cat) => (
            <Link 
              key={cat.id} 
              to={`/category/${cat.id}`}
              className="group relative h-64 rounded-xl overflow-hidden shadow-sm border border-outline-variant/30"
            >
              <img src={cat.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={cat.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white text-xl font-serif">{cat.name}</h3>
                <p className="text-white/80 text-sm italic">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured / Trending */}
      <section className="bg-surface-container-low py-20 px-6 md:px-12 my-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-serif text-primary">From the Kitchen</h2>
              <p className="text-on-surface-variant mt-2 italic">Our latest seasonal favorites tested to perfection.</p>
            </div>
            <Link to="/recipes" className="flex items-center gap-2 text-secondary font-semibold hover:gap-3 transition-all">
              View All Recipes <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trending.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
            {/* Added one more if trending is short */}
            {trending.length < 3 && RECIPES.slice(0, 3 - trending.length).map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-24">
        <div className="bg-primary/95 rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071&auto=format&fit=crop" 
              className="w-full h-full object-cover opacity-20 filter grayscale" 
              alt="Kitchen atmosphere" 
            />
          </div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 p-12 md:p-20 items-center">
            <div className="space-y-6">
              <span className="text-secondary font-bold uppercase tracking-[0.3em] text-xs">Join the Table</span>
              <h2 className="text-4xl md:text-5xl font-serif text-white leading-tight">
                Get wholesome <br /> recipes in your <br /><span className="italic text-secondary">inbox weekly.</span>
              </h2>
              <p className="text-on-primary/80 text-lg max-w-sm">
                No spam, just seasonal inspiration and the stories behind our favorite meals.
              </p>
            </div>
            <div className="space-y-4">
              <form className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="bg-white/10 border border-white/20 rounded-lg px-6 py-4 text-white placeholder:text-white/40 focus:bg-white/20 focus:outline-none focus:border-white/40 transition-all flex-grow shadow-inner"
                />
                <button className="bg-secondary text-on-secondary px-8 py-4 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-on-secondary-container transition-all hover:-translate-y-1 shadow-lg active:scale-95">
                  Subscribe
                </button>
              </form>
              <p className="text-[10px] text-white/40 uppercase tracking-widest text-center sm:text-left">
                Join 12,000+ home cooks. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
