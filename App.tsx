import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SnackLaunch } from './components/SnackLaunch';
import { Services } from './components/Services';
import { About } from './components/About';
import { Testimonials } from './components/Testimonials';
import { Contact } from './components/Contact';
import { Shop } from './components/Shop';
import { Footer } from './components/Footer';
import AIAssistant from "./components/AIAssistant";

import { CartModal } from './components/CartModal';
import { FloatingSeal } from './components/FloatingSeal';
import { PageView, CartItem } from './types';

function App() {
  const [currentView, setCurrentView] = useState<PageView>(PageView.HOME);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('marias-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('marias-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  // ✅ Fan collage (interactive)
  const [activeIndex, setActiveIndex] = useState(1);

  const fanImages = [
    {
      src: "/images/about-4.jpg",
      alt: "Happy dog at Maria's Dog Corner",
      label: "Expert Care",
      fallback: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80",
    },
    {
      src: "/images/about-6.jpg",
      alt: "Play time in the garden",
      label: "Safe Play",
      fallback: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80",
    },
    {
      src: "/images/about-5.jpg",
      alt: "Cozy rest time",
      label: "Cozy Stay",
      fallback: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80",
    },
  ];


  const renderView = () => {
    switch (currentView) {
      case PageView.HOME:
        return (
          <>
            <Hero onCtaClick={setCurrentView} />
            <SnackLaunch />
            <Services addToCart={addToCart} />

            {/* Premium Banner (Brand Colors) */}
            <div className="relative overflow-hidden bg-brand-teal py-16 px-4">
              {/* Soft brand overlays */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-teal via-brand-dark/30 to-brand-pink/25" />
              <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-yellow/20 blur-3xl" />
              <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-brand-pink/20 blur-3xl" />

              <div className="relative max-w-6xl mx-auto text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/15 text-white px-4 py-2 rounded-full border border-white/20 backdrop-blur-md">
                  <span className="text-brand-yellow">★</span>
                  <span className="text-sm font-semibold tracking-wide">
                    Premium Pet Sitting &amp; Snacks
                  </span>
                </div>

                <h2 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
                  Premium Pet Sitting &amp; Snacks
                </h2>

                <p className="mt-4 text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                  Professional care and natural treats for your beloved pets in Bristol.
                  We provide trusted sitting services and homemade snacks.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
                  {/* Primary CTA - Coral/Pink */}
                  <button
                    type="button"
                    onClick={() => setCurrentView(PageView.SERVICES)}
                    className="w-full sm:w-auto bg-brand-pink text-white font-bold py-4 px-10 rounded-full hover:brightness-110 transition-all duration-300 shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/35"
                  >
                    Book a Service
                  </button>

                  {/* Secondary CTA - Teal outline (brand) */}
                  <button
                    type="button"
                    onClick={() => setCurrentView(PageView.SHOP)}
                    className="w-full sm:w-auto border-2 border-white/70 text-white font-bold py-4 px-10 rounded-full hover:bg-white hover:text-brand-dark transition-all duration-300 shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/35"
                  >
                    Shop Snacks
                  </button>
                </div>
              </div>
            </div>

            {/* Image Section (Collage Card Style) */}
            <div className="py-16 px-4 bg-gray-50">
              <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">

                  {/* Text */}
                  <div>
                    <h3 className="text-3xl font-bold text-brand-dark mb-4">
                      Why Choose Maria&apos;s Dog Corner?
                    </h3>

                    <ul className="space-y-4 text-lg text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal text-2xl leading-none">✓</span>
                        Licensed and experienced pet care
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal text-2xl leading-none">✓</span>
                        Daily updates and photos
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal text-2xl leading-none">✓</span>
                        Homemade natural snacks
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal text-2xl leading-none">✓</span>
                        Trusted by Bristol pet owners
                      </li>
                    </ul>
                  </div>

                  {/* Collage Card (fixed overlap + hover + click) */}
                  <div className="relative flex items-center justify-center">
                    <div className="relative w-full max-w-[560px] h-[420px] group isolate">

                      {/* Left tilted card */}
                      <div
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-[42%] h-[78%] -rotate-6 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/80 z-10 cursor-pointer transition-all duration-500 group-hover:-rotate-3 group-hover:scale-[1.03] hover:z-[60] hover:scale-[1.06]`}
                        onClick={() => window.open("/images/about-5.jpg", "_blank")}
                        title="Open image"
                      >
                        <img
                          src="/images/about-5.jpg"
                          alt="Dog photo 1"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      </div>

                      {/* Right tilted card */}
                      <div
                        className={`absolute right-0 top-1/2 -translate-y-1/2 w-[42%] h-[78%] rotate-6 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/80 z-10 cursor-pointer transition-all duration-500 group-hover:rotate-3 group-hover:scale-[1.03] hover:z-[60] hover:scale-[1.06]`}
                        onClick={() => window.open("/images/about-4.jpg", "_blank")}
                        title="Open image"
                      >
                        <img
                          src="/images/about-4.jpg"
                          alt="Dog photo 2"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      </div>

                      {/* Center main card */}
                      <div
                        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[52%] h-[92%] rounded-[2.5rem] overflow-hidden border-4 border-white shadow-[0_25px_60px_-20px_rgba(0,0,0,0.35)] z-30 cursor-pointer transition-all duration-500 group-hover:scale-[1.04] hover:z-[70] hover:scale-[1.06]`}
                        onClick={() => window.open("/images/about-6.jpg", "_blank")}
                        title="Open image"
                      >
                        <img
                          src="/images/about-6.jpg"
                          alt="Dog photo 3"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        {/* Gradient + label */}
                        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-5">
                          <p className="text-white font-extrabold text-xl drop-shadow">Expert Care</p>
                          <p className="text-white/85 text-sm drop-shadow">Daily love, play & updates</p>
                        </div>
                      </div>

                      {/* Rating badge (kept visible) */}
                      <div className="absolute -bottom-6 left-6 bg-white px-6 py-4 rounded-2xl shadow-xl border border-gray-100 z-40">
                        <p className="text-2xl font-extrabold text-brand-coral">5★ Rated</p>
                        <p className="text-gray-600">by our clients</p>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            </div>

            <About />
            <Testimonials />
            <Contact />
          </>
        );

      case PageView.SHOP:
        return (
          <div className="animate-fade-in">
            <Shop addToCart={addToCart} />
          </div>
        );

      case PageView.SERVICES:
        return (
          <div className="animate-fade-in">
            <div className="pt-8">
              <Services addToCart={addToCart} />
            </div>
            <Contact />
          </div>
        );

      case PageView.ABOUT:
        return (
          <div className="animate-fade-in">
            <div className="pt-8">
              <About />
            </div>
            <Testimonials />
          </div>
        );

      case PageView.CONTACT:
        return (
          <div className="animate-fade-in pt-8">
            <Contact />
          </div>
        );

      default:
        return <Hero onCtaClick={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <div className="sticky top-0 z-40">
        <Navbar
          currentView={currentView}
          setView={setCurrentView}
          cartCount={totalItems}
        />
      </div>

      <main className="flex-grow">
        {renderView()}
      </main>

      <Footer setView={setCurrentView} />
      <AIAssistant setView={setCurrentView} />
      <FloatingSeal />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />
    </div>
  );
}

export default App;
