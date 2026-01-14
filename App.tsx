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

  const renderView = () => {
    switch (currentView) {
      case PageView.HOME:
        return (
          <>
            <Hero onCtaClick={setCurrentView} />
            <SnackLaunch />
            <Services addToCart={addToCart} />

            {/* Premium Banner */}
            <div className="bg-gradient-to-r from-brand-coral to-brand-orange py-16 px-4">
              <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Premium Pet Sitting & Snacks
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                  Professional care and natural treats for your beloved pets in Bristol. 
                  We provide trusted sitting services and homemade snacks.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={() => setCurrentView(PageView.SERVICES)}
                    className="bg-white text-brand-coral font-bold py-4 px-8 rounded-full hover:bg-white/90 transition-all duration-300 shadow-lg"
                  >
                    Book a Service
                  </button>
                  <button
                    onClick={() => setCurrentView(PageView.SHOP)}
                    className="border-2 border-white text-white font-bold py-4 px-8 rounded-full hover:bg-white hover:text-brand-coral transition-all duration-300"
                  >
                    Shop Snacks
                  </button>
                </div>
              </div>
            </div>

            {/* Image Section */}
            <div className="py-16 px-4 bg-gray-50">
              <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-3xl font-bold text-brand-dark mb-4">
                      Why Choose Maria's Dog Corner?
                    </h3>
                    <ul className="space-y-4 text-lg text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal text-2xl">✓</span>
                        Licensed and experienced pet care
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal text-2xl">✓</span>
                        Daily updates and photos
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal text-2xl">✓</span>
                        Homemade natural snacks
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-brand-teal text-2xl">✓</span>
                        Trusted by Bristol pet owners
                      </li>
                    </ul>
                  </div>
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80"
                      alt="Happy dog"
                      className="rounded-3xl shadow-2xl w-full h-[400px] object-cover"
                    />
                    <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl">
                      <p className="text-2xl font-bold text-brand-coral">5★ Rated</p>
                      <p className="text-gray-600">by our clients</p>
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
