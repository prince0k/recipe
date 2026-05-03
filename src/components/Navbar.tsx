import { Link } from 'react-router-dom';
import { Search, Heart, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 w-full z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4 flex justify-between items-center">
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-on-surface"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Brand */}
        <Link to="/" className="text-2xl font-bold font-serif hover:text-primary transition-colors">
          Stwart Lucas
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 font-serif italic text-lg">
          <Link to="/recipes" className="hover:text-primary transition-colors">Recipes</Link>
          <Link to="/categories" className="hover:text-primary transition-colors">Categories</Link>
          <Link to="/recipes" className="hover:text-primary transition-colors">Seasonal</Link>
          <Link to="/about" className="hover:text-primary transition-colors">Journal</Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6 text-on-surface">
          <button className="hidden sm:block hover:text-primary transition-colors">
            <Search size={22} />
          </button>
          <button className="hover:text-primary transition-colors">
            <Heart size={22} />
          </button>
          <button className="hover:text-primary transition-colors">
            <User size={22} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-surface border-b border-outline-variant/30 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4 font-serif italic text-xl">
              <Link to="/recipes" onClick={() => setIsMenuOpen(false)}>Recipes</Link>
              <Link to="/categories" onClick={() => setIsMenuOpen(false)}>Categories</Link>
              <Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
