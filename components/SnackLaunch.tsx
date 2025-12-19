import React from 'react';
import { Sparkles, PartyPopper, Award, CheckCircle2 } from 'lucide-react';

export const SnackLaunch = () => {
  return (
    // FONDO ACTUALIZADO: Degradado cálido para resaltar el lanzamiento
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
          
          {/* IMÁGENES DE TUS DISEÑOS REALES */}
          <div className="flex-1 relative">
            <div className="relative grid grid-cols-2 gap-4 rotate-2">
              <div className="space-y-4 pt-12">
                <img 
                  src="/images/products/salmon-hero.png" 
                  alt="Salmon Treats" 
                  className="rounded-[2rem] shadow-2xl border-4 border-white hover:scale-105 transition-transform"
                />
                <img 
                  src="/images/products/beef-hero.png" 
                  alt="Beef Treats" 
                  className="rounded-[2rem] shadow-2xl border-4 border-white hover:scale-105 transition-transform"
                />
              </div>
              <div className="space-y-4">
                <img 
                  src="/images/products/all-snacks.png" 
                  alt="Full Collection" 
                  className="rounded-[3rem] shadow-2xl border-4 border-white hover:scale-105 transition-transform"
                />
                <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-2 border-brand-teal/20 text-center">
                   <Award className="text-brand-teal w-10 h-10 mx-auto mb-2" />
                   <p className="text-[10px] font-black text-brand-teal uppercase tracking-tighter">
                     Official APHA <br/> Approved Manufacturer
                   </p>
                </div>
              </div>
            </div>
          </div>

          {/* TEXTO DE LANZAMIENTO */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-brand-pink text-white px-6 py-2 rounded-full shadow-lg mb-8">
              <PartyPopper size={20} />
              <span className="font-black uppercase tracking-widest text-sm">Our New Collection is Here!</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-display font-black text-brand-dark mb-6 leading-tight">
              Pure Love <br/> 
              <span className="text-brand-teal text-shadow">Certified Fresh</span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-10 italic">
              "Celebrating 20 years of care with the highest standards in pet nutrition."
            </p>

            <div className="grid grid-cols-2 gap-4 mb-12">
              {['67% Real Meat', '29% Veggies', 'APHA Certified', 'No Toxins'].map((feature) => (
                <div key={feature} className="flex items-center gap-2 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white">
                  <CheckCircle2 className="text-brand-teal w-5 h-5" />
                  <span className="font-bold text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-5 bg-brand-teal hover:bg-brand-dark text-white rounded-[2rem] font-black shadow-xl transition-all transform hover:-translate-y-1 active:scale-95"
            >
              Shop The Collection
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};