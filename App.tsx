import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { About } from './components/About';
import { Testimonials } from './components/Testimonials';
import { Contact } from './components/Contact';
import { Shop } from './components/Shop';
import { Footer } from './components/Footer';
import { AIAssistant } from './components/AIAssistant';
import { CartModal } from './components/CartModal';
import { FloatingSeal } from './components/FloatingSeal'; // Import the new Seal
import { PageView, Product, CartItem } from './types';

function App() {
  const [currentView, setCurrentView] = useState<PageView>(PageView.HOME);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Helper to render current view content
  const renderView = () => {
    switch (currentView) {
      case PageView.HOME:
        return (
          <>
            <Hero onCtaClick={setCurrentView} />
            {/* Pass addToCart to Services so users can book walks directly */}
            <Services addToCart={addToCart} />
            
            {/* GIANT PROMO BANNER */}
            <div className="relative h-[700px] w-full bg-cover bg-center flex items-center" 
                 style={{ 
                   backgroundImage: 'url("https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=2070&auto=format&fit=crop")' 
                 }}>
               <div className="absolute inset-0 bg-gradient-to-r from-brand-teal/40 to-transparent"></div>
               
               <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full h-full flex items-center">
                  <div className="bg-brand-teal/40 backdrop-blur-md p-10 md:p-14 rounded-[3rem] border border-white/40 shadow-2xl max-w-xl text-left">
                    <span className="text-brand-yellow font-bold tracking-widest uppercase mb-4 block text-sm shadow-black drop-shadow-sm">
                      New Collection
                    </span>
                    <h3 className="text-5xl md:text-6xl font-display font-extrabold text-white mb-6 leading-[0.95] drop-shadow-md">
                      Pure Love in<br/>
                      Every Bite.
                    </h3>
                    <p className="mb-8 text-lg md:text-xl text-white font-medium leading-relaxed drop-shadow-sm">
                      Our new 100% natural dehydrated treats are here. No preservatives, just real meat and veggies for your best friend.
                    </p>
                    <button 
                      onClick={() => setCurrentView(PageView.SHOP)}
                      className="bg-white text-brand-dark font-bold text-lg py-4 px-10 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    >
                      Shop the Collection
                    </button>
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

      {totalItems > 0 && !isCartOpen && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-24 right-6 z-40 bg-brand-pink text-white p-4 rounded-full shadow-2xl animate-bounce flex items-center gap-2 border-4 border-white hover:bg-red-500 transition-colors"
        >
          <div className="font-bold text-xl">{totalItems}</div>
        </button>
      )}
      
      <main className="flex-grow">
        {renderView()}
      </main>

      <Footer setView={setCurrentView} />
      <AIAssistant />
      <FloatingSeal /> {/* Displays the seal on all pages */}
      
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