import React from 'react';
import { Sparkles, PartyPopper, Award, CheckCircle2 } from 'lucide-react';
import { PageView } from '../types';

interface SnackLaunchProps {
  setView?: (view: PageView) => void;
}

export const SnackLaunch: React.FC<SnackLaunchProps> = ({ setView }) => {
  return (
    <div className="relative py-24 bg-gradient-to-br from-orange-50 via-white to-brand-pink/20 overflow-hidden">
      
      {/* CONFETI ANIMADO */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div 
            key={i}
            className="absolute animate-bounce opacity-50"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              color: i % 2 === 0 ? '#00C2CB' : '#F45D6F',
              animationDelay: `${Math.random() * 2}s`
            }}
          >
            <Sparkles size={Math.random() * 25 + 10} />
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* SECCIÓN DE IMÁGENES: Sin marcos blancos */}
          <div className="flex-1 relative">
            <div className="relative grid grid-cols-2 gap-4 rotate-2">
              <div className="space-y-4 pt-12">
                
                {/* Snack 1: Salmon */}
                <div className="group overflow-visible">
                  <img 
                    src="/images/products/salmon-hero.png" 
                    alt="Salmon Treats" 
                    className="w-full h-auto drop-shadow-[0_20px_35px_rgba(0,0,0,0.15)] transition-transform duration-700 ease-in-out group-hover:scale-125 cursor-zoom-in"
                  />
                </div>

                {/* Snack 2: Beef */}
                <div className="group overflow-visible">
                  <img 
                    src="/images/products/beef-hero.png" 
                    alt="Beef Treats" 
                    className="w-full h-auto drop-shadow-[0_20px_35px_rgba(0,0,0,0.15)] transition-transform duration-700 ease-in-out group-hover:scale-125 cursor-zoom-in"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {/* Snack 3: Colección Completa */}
                <div className="group overflow-visible">
                  <img 
                    src="/images/products/all-snacks.png" 
                    alt="Full Collection" 
                    className="w-full h-auto drop-shadow-[0_25px_40px_rgba(0,0,0,0.2)] transition-transform duration-700 ease-in-out group-hover:scale-110 cursor-zoom-in"
                  />
                </div>

                {/* Sello de APHA */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-2 border-brand-teal/20 text-center animate-pulse">
                   <Award className="text-brand-teal w-10 h-10 mx-auto mb-2" />
                   <p className="text-[10px] font-black text-brand-teal uppercase tracking-tighter">
                     Official APHA Approved <br/> Manufacturer
                   </p>
                </div>
              </div>
            </div>
          </div>

          {/* TEXTO DE LANZAMIENTO */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-brand-pink text-white px-6 py-2 rounded-full shadow-lg mb-8">
              <PartyPopper size={20} />
              <span className="font-black uppercase tracking-widest text-sm">Official Launch Party!</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-display font-black text-brand-dark mb-6 leading-tight">
              Pure Love <br/> 
              <span className="text-brand-teal">Certified Quality</span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-10 italic leading-relaxed">
              "After 20 years of care, we've created the perfect snack: 67% meat, 29% veggies, and 100% heart."
            </p>

            <div className="grid grid-cols-2 gap-4 mb-12">
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-sm">
                <CheckCircle2 className="text-brand-teal w-5 h-5" />
                <span className="font-bold text-gray-700 text-sm italic">APHA Certified</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-sm">
                <CheckCircle2 className="text-brand-teal w-5 h-5" />
                <span className="font-bold text-gray-700 text-sm italic">Fresh & Chilled</span>
              </div>
            </div>

            {/* BOTÓN CON NAVEGACIÓN CORREGIDA */}
            <button 
              onClick={() => {
                if (setView) {
                  setView(PageView.SHOP);
                }
              }}
              className="px-12 py-5 bg-brand-teal hover:bg-brand-dark text-white rounded-[2rem] font-black shadow-2xl transition-all transform hover:-translate-y-2 active:scale-95 text-lg uppercase tracking-widest"
            >
              Shop The Collection 🐾
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};