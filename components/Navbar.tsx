import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, Instagram, Music2, Facebook } from 'lucide-react';
import { PageView } from '../types';
import confetti from 'canvas-confetti';

interface NavbarProps {
  currentView: PageView;
  setView: (view: PageView) => void;
  cartCount?: number;
  onCartClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setView,
  cartCount = 0,
  onCartClick
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // ✅ Estado dinámico para el label del botón
  const [isPortalLoggedIn, setIsPortalLoggedIn] = useState(false);

  // ✅ URL del portal (estable)
  const PORTAL_URL = 'https://portal.mariasdogcorner.co.uk/#/login';

  // ✅ Key estándar de sesión (solo una fuente de verdad)
  const PORTAL_SESSION_KEY = 'mdc_portal_session';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ Detectar estado del portal sin romper nada
  useEffect(() => {
    const readPortalSession = () => {
      const v = localStorage.getItem(PORTAL_SESSION_KEY);
      setIsPortalLoggedIn(v === 'active');
    };

    // 1) Inicial
    readPortalSession();

    // 2) Si cambia desde otra pestaña
    const handleStorage = (e: StorageEvent) => {
      if (e.key === PORTAL_SESSION_KEY) readPortalSession();
    };

    // 3) Si vuelves a esta pestaña (muy común en tu flujo: web -> portal -> web)
    const handleFocus = () => readPortalSession();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
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

  const handleRoverClick = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00af87', '#ffb700', '#ff6b00'],
    });

    setTimeout(() => {
      window.open(
        'https://www.rover.com/members/maria-g-guaranteed-safety-and-happiness-for-your-pups/',
        '_blank',
        'noopener,noreferrer'
      );
    }, 500);
  };

  const handleCartClick = () => {
    if (onCartClick) onCartClick();
    else handleNavClick(PageView.SHOP);
  };

  const handlePortalClick = () => {
    window.open(PORTAL_URL, '_blank', 'noopener,noreferrer');
  };

  // ✅ Label dinámico (SaaS style)
  const portalLabel = isPortalLoggedIn ? 'Dashboard' : 'Login / Portal';
  const portalTitle = isPortalLoggedIn ? 'Open Dashboard' : 'Login / Portal';

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
          {/* Logo */}
          <div
            className="flex items-center gap-2 h-full py-2 cursor-pointer group flex-shrink-0"
            onClick={() => handleNavClick(PageView.HOME)}
          >
            <img
              src="/images/logo.png"
              alt="Maria's Dog Corner"
              className={`h-full w-auto object-contain transition-all duration-300 ${
                isScrolled ? 'max-h-10 md:max-h-12' : 'max-h-14 md:max-h-20'
              } group-hover:scale-105`}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="flex flex-col justify-center leading-none">
              <span
                className={`font-display font-bold text-brand-dark transition-all duration-300 ${
                  isScrolled ? 'text-lg md:text-xl' : 'text-xl md:text-3xl'
                }`}
              >
                Maria's
              </span>
              <span
                className={`font-display font-bold text-brand-pink transition-all duration-300 ${
                  isScrolled ? 'text-xs md:text-sm' : 'text-sm md:text-lg'
                } -mt-0.5 md:-mt-1`}
              >
                Dog Corner
              </span>
            </div>
          </div>

          {/* Desktop */}
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
                <span
                  className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-pink transition-all duration-300 group-hover:w-full ${
                    currentView === link.view ? 'w-full' : ''
                  }`}
                />
              </button>
            ))}

            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
              {/* Social */}
              <div className="flex items-center gap-3">
                <a
                  href="https://www.tiktok.com/@mariasdogcorner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:scale-125 transition-transform"
                  title="TikTok"
                >
                  <Music2 size={18} />
                </a>

                <a
                  href="https://www.instagram.com/mariadogcorner/?igshid=MzMyNGUyNmU2YQ%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E4405F] hover:scale-125 transition-transform"
                  title="Instagram"
                >
                  <Instagram size={18} />
                </a>

                <a
                  href="https://web.facebook.com/people/Marias-Dog-C%C3%B3rner/61573167980967/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1877F2] hover:scale-125 transition-transform"
                  title="Facebook"
                >
                  <Facebook size={18} />
                </a>

                <button
                  onClick={handleRoverClick}
                  className="bg-[#00af87] text-white p-1 rounded hover:scale-125 transition-transform flex items-center justify-center"
                  title="Rover"
                >
                  <span className="font-black text-[10px] px-1">R</span>
                </button>
              </div>

              {/* ✅ Portal button (dinámico) */}
              <button
                onClick={handlePortalClick}
                className={`px-4 py-2 rounded-full font-bold shadow-md transition-all text-sm flex items-center gap-2 ${
                  isPortalLoggedIn
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-brand-pink text-white hover:brightness-110'
                }`}
                title={portalTitle}
              >
                {isPortalLoggedIn && (
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
                {portalLabel}
              </button>

              {/* Cart */}
              <button
                onClick={handleCartClick}
                className="relative text-gray-600 hover:text-brand-teal transition-colors p-2 hover:scale-110 active:scale-95"
                title="Open Cart"
              >
                <ShoppingBag size={isScrolled ? 20 : 24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-pink text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* CTA */}
              <button
                onClick={() => handleNavClick(PageView.CONTACT)}
                className="bg-brand-dark text-white px-5 py-2 rounded-full font-bold shadow-md hover:bg-brand-teal transition-all text-sm"
              >
                Book Now
              </button>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={handleCartClick}
              className="relative text-gray-600 hover:text-brand-teal transition-colors p-2"
              title="Open Cart"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-pink text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-brand-dark p-2"
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-2xl z-50 h-screen overflow-y-auto">
          <div className="px-6 pt-6 pb-12 space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.view)}
                className={`block w-full text-left px-4 py-4 rounded-xl text-lg ${
                  currentView === link.view
                    ? 'bg-brand-light text-brand-dark font-bold'
                    : 'text-gray-600'
                }`}
              >
                {link.name}
              </button>
            ))}

            {/* ✅ Portal button mobile (dinámico) */}
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handlePortalClick();
              }}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2 ${
                isPortalLoggedIn
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-brand-pink text-white hover:brightness-110'
              }`}
            >
              {isPortalLoggedIn && (
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
              {portalLabel}
            </button>

            <div className="pt-6 mt-4 border-t border-gray-100 space-y-8 text-center">
              <div className="flex justify-center gap-8">
                <a
                  href="https://www.tiktok.com/@mariasdogcorner"
                  target="_blank"
                  rel="noreferrer"
                  className="text-black scale-150"
                >
                  <Music2 />
                </a>
                <a
                  href="https://www.instagram.com/mariadogcorner/?igshid=MzMyNGUyNmU2YQ%3D%3D"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#E4405F] scale-150"
                >
                  <Instagram />
                </a>
                <a
                  href="https://web.facebook.com/people/Marias-Dog-C%C3%B3rner/61573167980967/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1877F2] scale-150"
                >
                  <Facebook />
                </a>
                <button
                  onClick={handleRoverClick}
                  className="bg-[#00af87] text-white rounded px-3 py-1 font-black"
                >
                  R
                </button>
              </div>

              <button
                onClick={() => handleNavClick(PageView.CONTACT)}
                className="w-full bg-brand-dark text-white py-4 rounded-xl font-bold text-lg"
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
