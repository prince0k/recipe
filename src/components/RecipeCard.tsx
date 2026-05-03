import { Link } from 'react-router-dom';
import { Clock, BarChart, Star, Heart } from 'lucide-react';
import { Recipe } from '../types';
import { motion } from 'motion/react';
import { useState } from 'react';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-surface rounded-xl overflow-hidden shadow-sm border border-outline-variant/50 group cursor-pointer flex flex-col relative"
    >
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsSaved(!isSaved);
        }}
        className={`absolute top-4 right-4 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${isSaved ? 'bg-secondary text-white' : 'bg-surface/70 text-on-surface hover:bg-surface'}`}
      >
        <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
      </button>

      <Link to={`/recipe/${recipe.id}`} className="relative block overflow-hidden">
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-surface/90 backdrop-blur-sm text-on-surface font-sans text-xs px-3 py-1 rounded-full shadow-sm">
            {recipe.category}
          </span>
          <span className="bg-primary/90 backdrop-blur-sm text-on-primary font-sans text-xs px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Star size={10} fill="currentColor" /> {recipe.rating}
          </span>
        </div>
      </Link>
      
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <Link to={`/recipe/${recipe.id}`}>
            <h3 className="text-xl font-bold font-serif text-on-surface group-hover:text-primary transition-colors leading-snug">
              {recipe.title}
            </h3>
          </Link>
          <div className="flex items-center gap-4 mt-3 text-sm text-on-surface-variant">
            <span className="flex items-center gap-1">
              <Clock size={16} className="text-outline" /> {recipe.time}
            </span>
            <span className="flex items-center gap-1">
              <BarChart size={16} className="text-outline" /> {recipe.difficulty}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
