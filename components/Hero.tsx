import React from 'react';
import { Button } from './Button';
import { PageView } from '../types';
import { ShoppingBag, Star, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onCtaClick: (view: PageView) => void;
}

export const Hero: React.FC<HeroProps> = ({ onCtaClick }) => {
  return (
    <div className="relative w-full min-h-[85vh] flex flex-col md:flex-row bg-brand-teal">
      
      {/* Left Side: Brand Content (Solid Color Block) */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 py-16 md:px-16 lg:px-24 text-white relative z-10 order-2 md:order-1">
        
        {/* New Badge */}
        <div className="inline-flex items-center self-start gap-2 px-4 py-2 rounded-full bg-brand-pink text-white text-sm font-bold mb-8 shadow-lg transform -rotate-1 border border-white/20">
            <Star size={16} className="text-brand-yellow fill-current" />
            <span>NEW ARRIVAL: 100% Natural Treats</span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold leading-[0.95] tracking-tight mb-6 drop-shadow-sm">
          Happy Dog,<br />
          <span className="text-brand-yellow">Happy Life.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-teal-50 font-medium mb-10 max-w-md leading-relaxed">
          Premium natural snacks approved by UK vets. Give your best friend the nutrition they deserve with our new boutique collection.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Button 
            onClick={() => onCtaClick(PageView.SHOP)} 
            size="lg" 
            className="bg-brand-orange hover:bg-orange-500 text-white border-none text-xl px-10 py-5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transform transition-all"
          >
            Shop Now
          </Button>
          <Button 
            onClick={() => onCtaClick(PageView.SERVICES)} 
            variant="outline" 
            size="lg"
            className="border-2 border-white text-white hover:bg-white hover:text-brand-teal text-xl px-10 py-5 rounded-full"
          >
            Services
          </Button>
        </div>

        {/* PROMINENT TRUST SEAL SECTION */}
        <div className="flex items-center gap-6 border-t border-white/20 pt-8 mt-2 animate-fade-in">
           {/* The Seal - Styled like a stamped document */}
           <div className="relative group cursor-help shrink-0 transform hover:scale-105 transition-transform">
              <div className="w-28 h-28 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] flex items-center justify-center border-4 border-white/80">
                 <img 
                   src="/images/seal.png" 
                   alt="Animal & Plant Health Agency Approved" 
                   className="w-full h-full object-contain p-1.5 opacity-90"
                   onError={(e) => {
                     e.currentTarget.style.display = 'none';
                     e.currentTarget.parentElement!.innerHTML = `<span class="text-brand-dark font-bold text-center text-xs">UK<br/>APPROVED</span>`;
                   }}
                 />
              </div>
              {/* Verified Checkmark Badge */}
              <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1 border-2 border-brand-teal shadow-sm">
                <ShieldCheck size={16} />
              </div>
           </div>
           
           <div className="flex flex-col">
              <p className="font-bold text-white uppercase tracking-widest text-sm flex items-center gap-2">
                Officially Approved
                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] text-white">UK</span>
              </p>
              <p className="font-mono text-teal-100 text-sm mt-1">Animal & Plant Health Agency</p>
              <p className="font-mono text-brand-yellow text-xs mt-0.5 opacity-80">License No: U1596090</p>
              
              <div className="flex text-brand-yellow mt-2">
                 <Star size={14} fill="currentColor" />
                 <Star size={14} fill="currentColor" />
                 <Star size={14} fill="currentColor" />
                 <Star size={14} fill="currentColor" />
                 <Star size={14} fill="currentColor" />
              </div>
           </div>
        </div>
      </div>

      {/* Right Side: Giant Image (Full Bleed) */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-auto relative order-1 md:order-2 overflow-hidden bg-brand-light group">
        <div className="absolute inset-0 bg-brand-dark/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
        
        {/* 
            CAMBIAR FOTO PRINCIPAL / CHANGE HERO IMAGE:
            1. Sube tu foto a public/images/
            2. Cambia el src abajo.
        */}
        <img 
          src="https://images.unsplash.com/photo-1534361960057-19889db9621e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
          alt="Extremely happy dog" 
          className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[2s] ease-out"
        />
        
        {/* Floating Element on Image */}
        <div className="absolute bottom-8 right-8 z-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl max-w-xs transform rotate-2 animate-float hidden lg:block">
           <div className="flex items-center gap-3">
              <div className="bg-brand-pink p-2 rounded-full text-white">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className="font-bold text-brand-dark leading-tight">Best Seller Bundle</p>
                <p className="text-xs text-gray-500">Salmon & Beef Mix</p>
              </div>
              <span className="font-bold text-lg text-brand-orange ml-auto">£12.50</span>
           </div>
        </div>
      </div>
    </div>
  );
};