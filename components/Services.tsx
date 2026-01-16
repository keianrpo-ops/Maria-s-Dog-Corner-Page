import React from 'react';
import { Star, Check, ArrowRight, Calendar, Award } from 'lucide-react';
import { Product } from '../types';

interface ServicesProps {
  addToCart?: (product: Product) => void;
}

export const Services: React.FC<ServicesProps> = ({ addToCart }) => {
  
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookService = (serviceProduct: Product) => {
    if (addToCart) {
      addToCart(serviceProduct);
    }
  };

  return (
    <div className="relative py-12 md:py-24 bg-brand-light/30" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Intro Section - Limpia y Profesional */}
        <div className="text-center mb-12 md:mb-20 max-w-4xl mx-auto">
          <span className="text-brand-pink font-bold tracking-widest uppercase text-xs md:text-sm bg-brand-pink/10 px-3 py-1 rounded-full border border-brand-pink/20">
            Full Service Care
          </span>
          <h2 className="text-5xl md:text-8xl font-display font-black text-brand-dark mb-8 leading-none tracking-tight">
            Our <span className="text-brand-pink">Five-Star</span> <br/> Services
          </h2>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Everything your dog needs. Fully insured and approved with 20 years of expertise.
          </p>
        </div>
        
        {/* Services Grid - 6 Tarjetas Impecables */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          
          {/* 1. DOG WALKING - £15 */}
          <div className="group bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_50px_-12px_rgba(0,194,203,0.25)] transition-all duration-500 hover:-translate-y-2 border border-gray-100 flex flex-col h-full relative">
            <div className="absolute top-6 left-6 z-20 bg-brand-orange text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
              <Star size={10} fill="currentColor" /> POPULAR
            </div>
            <div className="h-64 p-4">
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
                    <img 
                      src="/images/services/walking.jpg" 
                      onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1605639148518-e7d6928d1c33?auto=format&fit=crop&w=800&q=80"; }}
                      alt="Dog Walking" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                </div>
            </div>
            <div className="px-8 pb-8 pt-4 flex flex-col flex-grow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold font-display text-gray-900">Dog Walking</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-bold text-gray-400 uppercase">from</span>
                  <span className="text-2xl font-extrabold text-brand-teal">£15</span>
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">Energizing group walks in safe, green spaces with photo updates.</p>
              <button onClick={() => handleBookService({ id: 'svc-walk', name: 'Dog Walking', price: 15, category: 'snack', image: '/images/services/walking.jpg', description: 'Dog walk' })} className="mt-auto w-full py-3.5 rounded-xl bg-gray-900 hover:bg-brand-teal text-white font-bold transition-all flex items-center justify-center gap-2">
                Book Now <Calendar size={18} />
              </button>
            </div>
          </div>

          {/* 2. HOME SITTING - £45 */}
          <div className="group bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_50px_-12px_rgba(244,93,111,0.25)] transition-all duration-500 hover:-translate-y-2 border border-gray-100 flex flex-col h-full">
            <div className="h-64 p-4">
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
                    <img 
                      src="/images/services/sitting.jpg" 
                      onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80"; }}
                      alt="Dog Sitting" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                </div>
            </div>
            <div className="px-8 pb-8 pt-4 flex flex-col flex-grow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold font-display text-gray-900">Home Sitting</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-bold text-gray-400 uppercase">night</span>
                  <span className="text-2xl font-extrabold text-brand-pink">£45</span>
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">Your pup's routine maintained with 24/7 love and expert care.</p>
              <button onClick={() => handleBookService({ id: 'svc-sit', name: 'Home Sitting', price: 45, category: 'snack', image: '/images/services/sitting.jpg', description: 'Overnight care' })} className="mt-auto w-full py-3.5 rounded-xl bg-gray-900 hover:bg-brand-pink text-white font-bold transition-all flex items-center justify-center gap-2">
                Book Now <Calendar size={18} />
              </button>
            </div>
          </div>

          {/* 3. VACATION CARE */}
          <div className="group bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_50px_-12px_rgba(255,213,79,0.25)] transition-all duration-500 hover:-translate-y-2 border border-brand-yellow/30 flex flex-col h-full">
            <div className="h-64 p-4">
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
                    <img 
                      src="/images/services/vacation.jpg" 
                      onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1575485670541-82a2b0cb0e25?auto=format&fit=crop&w=800&q=80"; }}
                      alt="Vacation Care" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                </div>
            </div>
            <div className="px-8 pb-8 pt-4 flex flex-col flex-grow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold font-display text-gray-900">Vacation Care</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-extrabold text-brand-yellow uppercase tracking-tight">Custom</span>
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">Long-term loving care. A true home-away-from-home experience.</p>
              <button onClick={scrollToContact} className="mt-auto w-full py-3.5 rounded-xl bg-brand-yellow hover:bg-yellow-400 text-white font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                Get Quote <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* 4. GROOMING - £35 */}
          <div className="group bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_50px_-12px_rgba(168,85,247,0.25)] transition-all duration-500 hover:-translate-y-2 border border-gray-100 flex flex-col h-full">
            <div className="h-64 p-4">
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
                    <img 
                      src="/images/services/grooming.jpg" 
                      onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80"; }}
                      alt="Grooming" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                </div>
            </div>
            <div className="px-8 pb-8 pt-4 flex flex-col flex-grow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold font-display text-gray-900">Grooming</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-bold text-gray-400 uppercase">from</span>
                  <span className="text-2xl font-extrabold text-purple-600">£35</span>
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">Full spa treatments, wash, cut, and nail clipping with organic shampoos.</p>
              <button onClick={() => handleBookService({ id: 'svc-groom', name: 'Grooming', price: 35, category: 'snack', image: '/images/services/grooming.jpg', description: 'Grooming' })} className="mt-auto w-full py-3.5 rounded-xl bg-gray-900 hover:bg-purple-600 text-white font-bold transition-all flex items-center justify-center gap-2">
                Book Now <Calendar size={18} />
              </button>
            </div>
          </div>

{false && (
  /* 5. TRAINING - £40 */
  <div className="group bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_50px_-12px_rgba(59,130,246,0.25)] transition-all duration-500 hover:-translate-y-2 border border-gray-100 flex flex-col h-full">
    <div className="h-64 p-4">
      <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
        <img
          src="/images/services/training.jpg"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80";
          }}
          alt="Training"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>
    </div>

    <div className="px-8 pb-8 pt-4 flex flex-col flex-grow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-2xl font-bold font-display text-gray-900">Training</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-xs font-bold text-gray-400 uppercase">/ hr</span>
          <span className="text-2xl font-extrabold text-blue-600">£40</span>
        </div>
      </div>
      <p className="text-gray-500 text-sm mb-4 leading-relaxed">
        Positive reinforcement techniques to help your pup learn fast.
      </p>
      <button
        onClick={() =>
          handleBookService({
            id: "svc-train",
            name: "Training",
            price: 40,
            category: "snack",
            image: "/images/services/training.jpg",
            description: "Training",
          })
        }
        className="mt-auto w-full py-3.5 rounded-xl bg-gray-900 hover:bg-blue-600 text-white font-bold transition-all flex items-center justify-center gap-2"
      >
        Book Now <Calendar size={18} />
      </button>
    </div>
  </div>
)}

          {/* 6. POP-IN VISITS - £12 */}
          <div className="group bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_50px_-12px_rgba(0,194,203,0.25)] transition-all duration-500 hover:-translate-y-2 border border-gray-100 flex flex-col h-full">
            <div className="h-64 p-4">
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
                    <img 
                      src="/images/services/pop-in.jpg" 
                      onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80"; }}
                      alt="Pop-in" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                </div>
            </div>
            <div className="px-8 pb-8 pt-4 flex flex-col flex-grow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold font-display text-gray-900">Pop-in Visits</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-bold text-gray-400 uppercase">visit</span>
                  <span className="text-2xl font-extrabold text-brand-teal">£12</span>
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">Short visits for feeding, garden breaks, and puppy play.</p>
              <button onClick={() => handleBookService({ id: 'svc-popin', name: 'Pop-in', price: 12, category: 'snack', image: '/images/services/pop-in.jpg', description: 'Pop-in visit' })} className="mt-auto w-full py-3.5 rounded-xl bg-gray-900 hover:bg-brand-teal text-white font-bold transition-all flex items-center justify-center gap-2">
                Book Now <Calendar size={18} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};