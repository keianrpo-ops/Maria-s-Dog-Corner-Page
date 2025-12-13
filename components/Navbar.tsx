import React, { useState } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { PageView } from '../types';

interface NavbarProps {
  currentView: PageView;
  setView: (view: PageView) => void;
  cartCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, cartCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', view: PageView.HOME },
    { name: 'Shop Snacks', view: PageView.SHOP },
    { name: 'Services', view: PageView.SERVICES },
    { name: 'About', view: PageView.ABOUT },
    { name: 'Contact', view: PageView.CONTACT },
  ];

  const handleNavClick = (view: PageView) => {
    setView(view);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100 h-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full"> 
          {/* Logo Section - Increased Size */}
          <div className="flex items-center h-full py-2 cursor-pointer" onClick={() => handleNavClick(PageView.HOME)}>
            {/* 
                INSTRUCTION: Ensure your logo file is named 'logo.png' 
                and placed inside the 'public/images' folder.
            */}
            <img 
              src="/images/logo.png" 
              alt="Maria's Dog Corner" 
              className="h-full max-h-20 w-auto object-contain hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // Fallback style if image is missing
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `<span class="font-display font-bold text-3xl text-brand-dark">Maria's<span class="text-brand-pink">DogCorner</span></span>`;
              }}
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.view)}
                className={`font-medium text-base tracking-wide transition-colors duration-200 ${
                  currentView === link.view 
                    ? 'text-brand-pink font-bold' 
                    : 'text-gray-500 hover:text-brand-teal'
                }`}
              >
                {link.name}
              </button>
            ))}
            
            <div className="flex items-center gap-4 ml-6 pl-6 border-l border-gray-200">
               <button 
                onClick={() => handleNavClick(PageView.SHOP)}
                className="relative text-gray-600 hover:text-brand-teal transition-colors p-2"
              >
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-pink text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
              
              <button 
                onClick={() => handleNavClick(PageView.CONTACT)}
                className="bg-brand-dark text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-brand-teal hover:shadow-lg transition-all transform hover:-translate-y-0.5 text-sm"
              >
                Book Now
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             <button 
                onClick={() => handleNavClick(PageView.SHOP)}
                className="relative text-gray-600"
              >
                <ShoppingBag size={26} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-pink text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-brand-dark focus:outline-none"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg z-50">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.view)}
                className={`block w-full text-left px-3 py-3 rounded-lg text-base font-medium ${
                  currentView === link.view
                    ? 'bg-brand-light text-brand-dark'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};