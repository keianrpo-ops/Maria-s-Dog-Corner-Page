import React, { useState, useEffect } from 'react';
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
import { FloatingSeal } from './components/FloatingSeal';
import { PageView, Product, CartItem } from './types';

function App() {
  const [currentView, setCurrentView] = useState<PageView>(PageView.HOME);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // EFECTO DE SCROLL: Esto soluciona que la página se quede abajo al navegar
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

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

  const renderView = () => {
    switch (currentView) {
      case PageView.HOME:
        return (
          <>
            <Hero onCtaClick={setCurrentView} />
            <Services addToCart={addToCart} />
            
            {/* GIANT PROMO BANNER */}
            <div className="relative h-[400px] md:h-[800px] w-full bg-no-repeat bg-center flex items-center overflow-hidden" 
                 style={{ 
                   backgroundSize: 'cover',
                   backgroundPosition: 'center 20%', 
                   backgroundImage: `url("/images/banners/promo-bite.jpg"), url("https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=2070&auto=format&fit=crop")` 
                 }}>
              <div className="absolute inset-0 bg-gradient-to-r from-brand-teal/80 via-brand-teal/40 to-transparent"></div>
              <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-12 w-full h-full flex items-center justify-center md:justify-start">
                 <div className="bg-brand-teal/40 backdrop-blur-md p-6 md:p-14 rounded-3xl md:rounded-[3rem] border border-white/40 shadow-2xl max-w-sm md:max-w-xl text-center md:text-left mx-2">
                   <div className="inline-flex items-center mb-4 md:mb-6">
                     <span className="relative px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-yellow to-brand-orange text-brand-dark font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-lg overflow-hidden group">
                       <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></span>
                       <span className="relative z-10">New Collection</span>
                     </span>
                   </div>
                   <h3 className="text-3xl md:text-6xl font-display font-extrabold text-white mb-3 md:mb-6 leading-tight drop-shadow-md">
                     Pure Love in<br/> Every Bite.
                   </h3>
                   <p className="mb-6 md:mb-8 text-sm md:text-xl text-white font-medium leading-relaxed drop-shadow-sm">
                     Our new 100% natural dehydrated treats are here. No preservatives, just real meat.
                   </p>
                   <button 
                     onClick={() => setCurrentView(PageView.SHOP)}
                     className="w-full md:w-auto bg-white text-brand-dark font-bold text-base md:text-lg py-3 md:py-4 px-6 md:px-10 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 active:scale-95"
                   >
                     Shop Collection
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
          className="fixed bottom-24 right-4 md:right-6 z-40 bg-brand-pink text-white p-3 md:p-4 rounded-full shadow-2xl animate-bounce flex items-center gap-2 border-4 border-white hover:bg-red-500 transition-colors"
        >
          <div className="font-bold text-lg md:text-xl w-6 h-6 md:w-auto flex items-center justify-center">{totalItems}</div>
        </button>
      )}
      
      <main className="flex-grow">
        {renderView()}
      </main>

      <Footer setView={setCurrentView} />
      
      {/* EL ASISTENTE: Conectado para navegar */}
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