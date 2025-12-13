import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { PageView } from '../types';

interface NavbarProps {
  currentView: PageView;
  setView: (view: PageView) => void;
  cartCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, cartCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scroll to animate navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 border-b border-gray-100/50 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md h-16 md:h-20 shadow-md' 
          : 'bg-white h-20 md:h-24 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full"> 
          {/* Logo Section */}
          <div className="flex items-center h-full py-2 cursor-pointer group" onClick={() => handleNavClick(PageView.HOME)}>
            <img 
              src="/images/logo.png" 
              alt="Maria's Dog Corner" 
              className={`h-full w-auto object-contain transition-all duration-300 ${isScrolled ? 'max-h-8 md:max-h-12' : 'max-h-12 md:max-h-20'} group-hover:scale-105`}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `<span class="font-display font-bold text-xl md:text-3xl text-brand-dark">Maria's<span class="text-brand-pink">DogCorner</span></span>`;
              }}
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.view)}
                className={`font-medium text-sm md:text-base tracking-wide transition-all duration-200 relative group ${
                  currentView === link.view 
                    ? 'text-brand-pink font-bold' 
                    : 'text-gray-500 hover:text-brand-teal'
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-pink transition-all duration-300 group-hover:w-full ${currentView === link.view ? 'w-full' : ''}`}></span>
              </button>
            ))}
            
            <div className="flex items-center gap-4 ml-6 pl-6 border-l border-gray-200">
               <button 
                onClick={() => handleNavClick(PageView.SHOP)}
                className="relative text-gray-600 hover:text-brand-teal transition-colors p-2 hover:bg-gray-50 rounded-full"
              >
                <ShoppingBag size={isScrolled ? 20 : 24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-pink text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>
              
              <button 
                onClick={() => handleNavClick(PageView.CONTACT)}
                className={`bg-brand-dark text-white rounded-full font-bold shadow-md hover:bg-brand-teal hover:shadow-lg transition-all transform hover:-translate-y-0.5 text-sm ${
                  isScrolled ? 'px-5 py-2' : 'px-6 py-2.5'
                }`}
              >
                Book Now
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
             <button 
                onClick={() => handleNavClick(PageView.SHOP)}
                className="relative text-gray-600 p-2"
              >
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-brand-pink text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-brand-dark focus:outline-none p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 absolute w-full shadow-2xl z-50 animate-fade-in h-screen">
          <div className="px-4 pt-4 pb-6 space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.view)}
                className={`block w-full text-left px-4 py-4 rounded-xl text-lg font-medium transition-colors ${
                  currentView === link.view
                    ? 'bg-brand-light text-brand-dark font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </button>
            ))}
            <div className="pt-6 mt-4 border-t border-gray-100">
               <button 
                onClick={() => handleNavClick(PageView.CONTACT)}
                className="w-full bg-brand-dark text-white py-4 rounded-xl font-bold shadow-md active:scale-95 transition-transform text-lg"
              >
                Book an Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};