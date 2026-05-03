import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full py-16 px-6 bg-surface-container-low border-t border-outline-variant/30">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
        <div className="md:col-span-2 space-y-4">
          <Link to="/" className="text-xl font-bold font-serif italic">Stwart Lucas</Link>
          <p className="text-on-surface-variant font-serif text-sm tracking-wide">
            © 2024 Stwart Lucas. Crafted for the home cook.
          </p>
        </div>
        <div className="flex flex-col gap-3 font-serif text-sm tracking-wide underline-offset-4">
          <Link to="/about" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">About Us</Link>
          <button className="text-left hover:underline opacity-80 hover:opacity-100 transition-opacity">Newsletter Signup</button>
        </div>
        <div className="flex flex-col gap-3 font-serif text-sm tracking-wide underline-offset-4">
          <button className="text-left hover:underline opacity-80 hover:opacity-100 transition-opacity">Privacy Policy</button>
          <Link to="/contact" className="hover:underline opacity-80 hover:opacity-100 transition-opacity">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
