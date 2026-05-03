import { useParams, Link } from 'react-router-dom';
import { RECIPES } from '../constants';
import { Clock, BarChart, Flame, Star, Bookmark, Share2, PlayCircle, ChevronRight, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function RecipeDetailScreen() {
  const { id } = useParams();
  const recipe = RECIPES.find(r => r.id === id);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  if (!recipe) {
    return <div className="p-20 text-center text-2xl font-serif italic">Recipe not found.</div>;
  }

  const toggleIngredient = (idx: string) => {
    setCheckedIngredients(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  return (
    <div className="animate-fade-in bg-background relative">
      <AnimatePresence>
        {showShareToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-full shadow-2xl font-serif italic text-sm"
          >
            Link copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-outline mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/recipes" className="hover:text-primary transition-colors">Recipes</Link>
          <ChevronRight size={12} />
          <span className="text-on-surface-variant">{recipe.title}</span>
        </div>

        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          <div className="lg:col-span-5 order-2 lg:order-1 space-y-8 z-10 lg:-mr-12 bg-surface/50 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none p-6 lg:p-0 rounded-2xl">
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                <Clock size={16} /> {recipe.time}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                <BarChart size={16} /> {recipe.difficulty}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider">
                <Flame size={16} /> {recipe.calories} kcal
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold font-serif text-on-surface leading-[1.1]">
              {recipe.title}
            </h1>
            <p className="text-lg text-on-surface-variant leading-relaxed italic border-l-4 border-secondary/30 pl-6 py-2">
              "{recipe.summary}"
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => setIsSaved(!isSaved)}
                className={`inline-flex items-center gap-2 px-8 py-3 rounded-md shadow-lg transition-all hover:-translate-y-0.5 font-bold uppercase tracking-wider text-xs ${isSaved ? 'bg-primary text-white' : 'bg-secondary text-on-secondary'}`}
              >
                <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} /> 
                {isSaved ? 'Saved to Favorites' : 'Save Recipe'}
              </button>
              <button className="inline-flex items-center gap-2 border border-primary text-primary hover:bg-primary/5 px-8 py-3 rounded-md transition-all font-bold uppercase tracking-wider text-xs group">
                <PlayCircle size={18} className="group-hover:scale-110 transition-transform" /> Watch Video
              </button>
              <button 
                onClick={handleShare}
                className="w-12 h-12 flex items-center justify-center rounded-full border border-outline-variant hover:bg-surface-container transition-all active:scale-95"
              >
                <Share2 size={20} />
              </button>
            </div>

            <div className="flex items-center gap-2 text-tertiary">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill={i < Math.floor(recipe.rating) ? "currentColor" : "none"} className={i < Math.floor(recipe.rating) ? "" : "text-outline-variant"} />
                ))}
              </div>
              <span className="text-xs font-bold tracking-widest text-on-surface-variant uppercase pt-0.5">
                {recipe.rating} ({recipe.reviewCount} Reviews)
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <img src={recipe.image} className="w-full h-full object-cover" alt={recipe.title} />
            </div>
          </div>
        </section>

        {/* Content Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-16">
            {/* Ingredients */}
            <section id="ingredients">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-4xl font-serif text-on-surface">Ingredients</h2>
                <div className="h-px bg-outline-variant flex-grow opacity-50"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {recipe.ingredients.map((section, sidx) => (
                  <div key={sidx} className="space-y-6">
                    <h3 className="text-2xl font-serif text-primary italic">{section.section}</h3>
                    <ul className="space-y-4">
                      {section.items.map((item, iidx) => {
                        const key = `${sidx}-${iidx}`;
                        return (
                          <li 
                            key={iidx}
                            className="flex items-start gap-4 group cursor-pointer"
                            onClick={() => toggleIngredient(key)}
                          >
                            <div className={`w-6 h-6 mt-0.5 rounded-full border-2 border-outline-variant flex-shrink-0 flex items-center justify-center transition-all ${checkedIngredients[key] ? 'bg-primary border-primary' : 'group-hover:border-primary'}`}>
                              {checkedIngredients[key] && <div className="w-2 h-2 rounded-full bg-white animate-fade-in" />}
                            </div>
                            <span className={`text-on-surface transition-all ${checkedIngredients[key] ? 'opacity-40 italic line-through' : ''}`}>
                              {item}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Instructions */}
            <section id="instructions">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-4xl font-serif text-on-surface">Instructions</h2>
                <div className="h-px bg-outline-variant flex-grow opacity-50"></div>
              </div>

              <div className="space-y-12">
                {recipe.instructions.map((section, sidx) => (
                  <div key={sidx} className="space-y-8">
                    {section.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-8">
                        <div className="text-5xl font-serif text-tertiary/20 font-bold select-none pt-1">
                          {String(idx + 1).padStart(2, '0')}
                        </div>
                        <div className="space-y-2 pt-2">
                          <h4 className="text-xs font-bold text-primary uppercase tracking-[0.2em]">{step.title}</h4>
                          <p className="text-on-surface-variant leading-relaxed text-lg">
                            {step.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-12">
            <div className="sticky top-32 space-y-8">
              {/* Nutrition Card */}
              <div className="bg-surface-container rounded-2xl p-8 border border-outline-variant/30 shadow-sm relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
                <h3 className="text-2xl font-serif text-on-surface mb-8 relative z-10 flex items-center gap-2">
                  <Info className="text-primary" size={24} /> Nutrition
                </h3>
                <div className="space-y-4 relative z-10">
                  {Object.entries(recipe.nutrition).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-end border-b border-outline-variant/30 pb-2">
                      <span className="text-on-surface-variant capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className={`text-on-surface ${key === 'calories' ? 'text-2xl font-bold' : 'font-semibold'}`}>
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-outline mt-6 italic">
                  *Percent Daily Values are based on a 2000 calorie diet.
                </p>
              </div>

              {/* Equipment Card */}
              <div className="bg-surface-bright rounded-2xl p-8 border border-outline-variant/30 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-[0.2em]">Essential Equipment</h4>
                <div className="flex flex-wrap gap-2">
                  {['Parchment Paper', 'Pastry Blender', 'Baking Sheet'].map(item => (
                    <span key={item} className="px-3 py-1.5 bg-surface-container-high text-on-surface-variant text-xs font-medium rounded-md border border-outline-variant/30">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
