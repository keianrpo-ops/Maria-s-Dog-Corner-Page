import React from 'react';
import { Button } from './Button';
import { PageView } from '../types';
import { ShoppingBag, Star, ShieldCheck, ArrowRight } from 'lucide-react';

interface HeroProps {
  onCtaClick: (view: PageView) => void;
}

export const Hero: React.FC<HeroProps> = ({ onCtaClick }) => {
  return (
    <div className="relative w-full min-h-[85vh] flex flex-col md:flex-row bg-brand-teal overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/2 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl"></div>
      </div>

      {/* Left Side: Brand Content */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 text-white relative z-10 order-2 md:order-1">
        
        {/* New Badge */}
        <div className="inline-flex items-center self-start gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-brand-pink text-white text-xs md:text-sm font-bold mb-6 md:mb-8 shadow-lg transform -rotate-1 border border-white/20 hover:scale-105 transition-transform cursor-default">
            <Star size={14} className="text-brand-yellow fill-current animate-pulse" />
            <span>NEW: 100% Natural Treats</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold leading-[0.95] tracking-tight mb-4 md:mb-6 drop-shadow-sm">
          Happy Dog,<br />
          <span className="text-brand-yellow relative">
            Happy Life.
            <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-orange/80" viewBox="0 0 100 10" preserveAspectRatio="none">
               <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
            </svg>
          </span>
        </h1>
        
        <p className="text-base md:text-xl text-teal-50 font-medium mb-8 md:mb-10 max-w-md leading-relaxed">
          Premium natural snacks approved by UK vets. Give your best friend the nutrition they deserve.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 md:gap-5 mb-8 md:mb-12">
          {/* Glowing Primary Button */}
          <div className="relative group w-full sm:w-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange to-brand-yellow rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <button 
              onClick={() => onCtaClick(PageView.SHOP)} 
              className="relative w-full sm:w-auto bg-brand-orange hover:bg-orange-500 text-white text-lg md:text-xl font-bold px-8 py-4 md:px-10 md:py-5 rounded-full shadow-xl flex items-center justify-center gap-3 transition-all transform group-hover:translate-y-[-2px] active:scale-95"
            >
              Shop Now
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <Button 
            onClick={() => onCtaClick(PageView.SERVICES)} 
            variant="outline" 
            size="lg"
            className="w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white hover:text-brand-teal text-lg md:text-xl px-8 py-4 md:px-10 md:py-5 rounded-full hover:border-white backdrop-blur-sm active:scale-95"
          >
            Services
          </Button>
        </div>

        {/* PROMINENT TRUST SEAL SECTION */}
        <div className="flex items-center gap-4 md:gap-6 border-t border-white/20 pt-6 md:pt-8 mt-2 animate-fade-in">
           {/* The Seal */}
           <div className="relative group cursor-help shrink-0 transform hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-full shadow-[0_0_25px_rgba(255,255,255,0.2)] flex items-center justify-center border-4 border-white/80">
                 <img 
                   src="/images/seal.png" 
                   alt="APHA Approved" 
                   className="w-full h-full object-contain p-1.5 opacity-90"
                   onError={(e) => {
                     e.currentTarget.style.display = 'none';
                     e.currentTarget.parentElement!.innerHTML = `<span class="text-brand-dark font-bold text-center text-[8px] md:text-[10px] leading-tight">UK<br/>GOVT<br/>APPROVED</span>`;
                   }}
                 />
              </div>
              {/* Verified Checkmark Badge */}
              <div className="absolute -top-1 -right-1 bg-[#00C853] text-white rounded-full p-1 border-[2px] md:border-[3px] border-brand-teal shadow-sm">
                <ShieldCheck size={12} className="md:w-[14px]" strokeWidth={3} />
              </div>
           </div>
           
           <div className="flex flex-col">
              <p className="font-bold text-white uppercase tracking-widest text-xs md:text-sm flex items-center gap-2">
                Officially Approved
                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] text-white font-mono">UK</span>
              </p>
              <p className="font-mono text-teal-100 text-xs md:text-sm mt-1">Animal & Plant Health Agency</p>
              <div className="flex items-center gap-3 mt-1">
                 <p className="font-mono text-brand-yellow text-[10px] md:text-xs opacity-80">License No: U1596090</p>
                 <div className="flex text-brand-yellow">
                    <Star size={10} className="md:w-[12px]" fill="currentColor" />
                    <Star size={10} className="md:w-[12px]" fill="currentColor" />
                    <Star size={10} className="md:w-[12px]" fill="currentColor" />
                    <Star size={10} className="md:w-[12px]" fill="currentColor" />
                    <Star size={10} className="md:w-[12px]" fill="currentColor" />
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Right Side: Giant Image (Full Bleed) */}
      <div className="w-full md:w-1/2 h-[40vh] md:h-auto relative order-1 md:order-2 overflow-hidden bg-brand-light group perspective-1000">
        <div className="absolute inset-0 bg-brand-dark/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
        
        {/* Curved Divider for Mobile */}
        <div className="absolute top-0 left-0 w-full h-12 bg-brand-teal rounded-b-[50%] z-20 md:hidden transform -translate-y-6"></div>
        
        <img 
          src="https://images.unsplash.com/photo-1534361960057-19889db9621e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
          alt="Extremely happy dog" 
          className="absolute inset-0 w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-[3s] ease-out"
        />
        
        {/* Floating Element on Image (Desktop Only) */}
        <div className="absolute bottom-8 right-8 z-20 bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl max-w-xs transform rotate-2 animate-float hidden lg:block border border-white/50">
           <div className="flex items-center gap-4">
              <div className="bg-brand-pink p-3 rounded-full text-white shadow-lg shadow-brand-pink/30">
                <ShoppingBag size={22} />
              </div>
              <div>
                <p className="font-bold text-brand-dark leading-tight text-lg">Best Seller</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Salmon & Beef Mix</p>
              </div>
              <span className="font-bold text-xl text-brand-orange ml-auto">£12.50</span>
           </div>
        </div>
      </div>
    </div>
  );
};