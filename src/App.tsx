import { BrowserRouter as Router, Routes, Route, ScrollRestoration } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeScreen from './screens/HomeScreen';
import RecipeListingScreen from './screens/RecipeListingScreen';
import RecipeDetailScreen from './screens/RecipeDetailScreen';
import AboutScreen from './screens/AboutScreen';
import ContactScreen from './screens/ContactScreen';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
        <ScrollToTop />
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/recipes" element={<RecipeListingScreen />} />
            <Route path="/category/:categoryId" element={<RecipeListingScreen />} />
            <Route path="/recipe/:id" element={<RecipeDetailScreen />} />
            <Route path="/about" element={<AboutScreen />} />
            <Route path="/contact" element={<ContactScreen />} />
            {/* Catch-all to Home */}
            <Route path="*" element={<HomeScreen />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
