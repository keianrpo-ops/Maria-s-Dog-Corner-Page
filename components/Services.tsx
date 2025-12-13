import React from 'react';
import { Dog, Home, Sun, Heart, Star, Check, ArrowRight, Scissors, GraduationCap, Calendar } from 'lucide-react';
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
        
        {/* Intro Section */}
        <div className="text-center mb-12 md:mb-20 max-w-4xl mx-auto">
          <span className="text-brand-pink font-bold tracking-widest uppercase text-xs md:text-sm bg-brand-pink/10 px-3 py-1 rounded-full">Full Service Care</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-brand-dark mb-4 mt-4">
            Our Services
          </h2>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Everything your dog needs. Fully insured & approved.
          </p>
        </div>
        
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          
          {/* 1. DOG WALKING */}
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_50px_-12px_rgba(0,194,203,0.25)] transition-all duration-300 hover:-translate-y-2 border border-gray-100 flex flex-col group h-full">
            {/* FRAMED IMAGE CONTAINER - Reverted to h-72, object-contain */}
            <div className="h-72 p-5 bg-brand-teal/5">
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-sm border border-black/5 bg-white flex items-center justify-center">
                    <img 
                        src="/images/services/walking.jpg" 
                        onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1605639148518-e7d6928d1c33?auto=format&fit=crop&w=800&q=80";
                        }}
                        alt="Dog Walking" 
                        className="w-full h-full object-contain transform transition-transform duration-700 hover:scale-105" 
                    />
                    {/* INTEGRATED PRICE BADGE */}
                    <div className="absolute bottom-3 right-3 z-20">
                        <div className="bg-white/95 backdrop-blur-xl px-3 py-1.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center gap-1 border border-white/50">
                            <span className="text-xs font-bold text-gray-400 mr-1">from</span>
                            <span className="text-lg font-display font-extrabold text-brand-teal">£15</span>
                        </div>
                    </div>
                    <div className="absolute top-3 left-3 z-20 bg-brand-orange text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <Star size={10} fill="currentColor" /> POPULAR
                    </div>
                </div>
            </div>
            
            <div className="px-8 pb-8 pt-4 flex flex-col flex-grow">
              <div className="mb-4">
                  <h3 className="text-2xl font-bold font-display text-gray-900 mb-2">Dog Walking</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Energizing group walks in safe, green spaces with furry friends.</p>
              </div>
              
              <ul className="space-y-2 mb-6 flex-grow">
                 <li className="flex items-center gap-3 text-gray-700 text-sm"><Check size={16} className="text-brand-teal shrink-0" /> <span>GPS Tracked walks</span></li>
                 <li className="flex items-center gap-3 text-gray-700 text-sm"><Check size={16} className="text-brand-teal shrink-0" /> <span>Photo updates</span></li>
                 <li className="flex items-center gap-3 text-gray-700 text-sm"><Check size={16} className="text-brand-teal shrink-0" /> <span>Pick-up & Drop-off</span></li>
              </ul>

              <div className="mt-auto pt-6 border-t border-gray-100">
                <button 
                  onClick={() => handleBookService({
                    id: 'svc-walk-group', name: 'Group Walk', price: 15, category: 'snack', 
                    image: '/images/services/walking.jpg', // Used for cart thumbnail
                    description: 'Group adventure walk'
                  })}
                  className="w-full py-3.5 rounded-xl bg-gray-900 hover:bg-brand-teal text-white font-bold shadow-lg transition-colors flex items-center justify-center gap-2 group/btn"
                >
                  <span>Book Now</span>
                  <Calendar size={18} className="text-gray-400 group-hover/btn:text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. DOG SITTING */}
           <div className="bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_50px_-12px_rgba(244,93,111,0.25)] transition-all duration-300 hover:-translate-y-2 border border-gray-100 flex flex-col group h-full">
            {/* FRAMED IMAGE CONTAINER - Reverted to h-72, object-contain */}
            <div className="h-72 p-5 bg-brand-pink/5">
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-sm border border-black/5 bg-white flex items-center justify-center">
                    <img 
                        src="/images/services/sitting.jpg" 
                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80"; }}
                        alt="Dog Sitting" 
                        className="w-full h-full object-contain transform transition-transform duration-700 hover:scale-105" 
                    />
                    {/* INTEGRATED PRICE BADGE */}
                    <div className="absolute bottom-3 right-3 z-20">
                        <div className="bg-white/95 backdrop-blur-xl px-3 py-1.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center gap-1 border border-white/50">
                            <span className="text-xs font-bold text-gray-400 mr-1">night</span>
                            <span className="text-lg font-display font-extrabold text-brand-pink">£45</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 pb-8 pt-4 flex flex-col flex-grow">
               <div className="mb-4">
                  <h3 className="text-2xl font-bold font-display text-gray-900 mb-2">Home Sitting</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Comfort in your own home. We maintain their routine perfectly.</p>
              </div>

               <ul className="space-y-2 mb-6 flex-grow">
                 <li className="flex items-center gap-3 text-gray-700 text-sm"><Check size={16} className="text-brand-pink shrink-0" /> <span>Routine maintained</span></li>
                 <li className="flex items-center gap-3 text-gray-700 text-sm"><Check size={16} className="text-brand-pink shrink-0" /> <span>Overnight stays</span></li>
                 <li className="flex items-center gap-3 text-gray-700 text-sm"><Check size={16} className="text-brand-pink shrink-0" /> <span>Cuddles included</span></li>
              </ul>

              <div className="mt-auto pt-6 border-t border-gray-100">
                 <button 
                     onClick={() => handleBookService({
                      id: 'svc-sit-24', name: 'Overnight Sitting', price: 45, category: 'snack', 
                      image: '/images/services/sitting.jpg', 
                      description: 'Full day and night care'
                    })}
                  className="w-full py-3.5 rounded-xl bg-gray-900 hover:bg-brand-pink text-white font-bold shadow-lg transition-colors flex items-center justify-center gap-2 group/btn"
                >
                  <span>Book Now</span>
                  <Calendar size={18} className="text-gray-400 group-hover/btn:text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* 3. VACATION CARE */}
           <div className="bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_50px_-12px_rgba(255,213,79,0.25)] transition-all duration-300 hover:-translate-y-2 border border-brand-yellow/30 flex flex-col group h-full">
             {/* FRAMED IMAGE CONTAINER - Reverted to h-72, object-contain */}
             <div className="h-72 p-5 bg-brand-yellow/5">
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-sm border border-black/5 bg-white flex items-center justify-center">
                    <img 
                        src="/images/services/vacation.jpg" 
                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1575485670541-82a2b0cb0e25?auto=format&fit=crop&w=800&q=80"; }}
                        alt="Vacation Care" 
                        className="w-full h-full object-contain transform transition-transform duration-700 hover:scale-105" 
                    />
                    {/* INTEGRATED PRICE BADGE */}
                    <div className="absolute bottom-3 right-3 z-20">
                        <div className="bg-white/95 backdrop-blur-xl px-3 py-1.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center gap-1 border border-white/50">
                            <span className="text-xs font-bold text-gray-400 mr-1 uppercase">Quote</span>
                            <span className="text-lg font-display font-extrabold text-brand-yellow">Custom</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 pb-8 pt-4 flex flex-col flex-grow">
              <div className="mb-4">
                  <h3 className="text-2xl font-bold font-display text-gray-900 mb-2">Vacation Care</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Long-term loving care in our home or yours while you travel.</p>
              </div>

               <ul className="space-y-2 mb-6 flex-grow">
                 <li className="flex items-center gap-3 text-gray-700 text-sm"><Check size={16} className="text-brand-yellow shrink-0" /> <span>Home-away-from-home</span></li>
                 <li className="flex items-center gap-3 text-gray-700 text-sm"><Check size={16} className="text-brand-yellow shrink-0" /> <span>Daily video calls</span></li>
              </ul>

              <div className="mt-auto pt-6 border-t border-gray-100">
                 <button 
                  onClick={scrollToContact}
                  className="w-full py-3.5 rounded-xl bg-brand-yellow hover:bg-yellow-400 text-white font-bold shadow-lg transition-colors flex items-center justify-center gap-2 group/btn"
                 >
                   <span>Get Quote</span>
                   <ArrowRight size={18} />
                 </button>
              </div>
            </div>
          </div>

           {/* 4. DOG GROOMING */}
           <div className="bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_50px_-12px_rgba(168,85,247,0.25)] transition-all duration-300 hover:-translate-y-2 border border-gray-100 flex flex-col group h-full">
             {/* FRAMED IMAGE CONTAINER - Reverted to h-72, object-contain */}
             <div className="h-72 p-5 bg-purple-50">
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-sm border border-black/5 bg-white flex items-center justify-center">
                    <img 
                        src="/images/services/grooming.jpg" 
                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80"; }}
                        alt="Dog Grooming" 
                        className="w-full h-full object-contain transform transition-transform duration-700 hover:scale-105" 
                    />
                    {/* INTEGRATED PRICE BADGE */}
                    <div className="absolute bottom-3 right-3 z-20">
                        <div className="bg-white/95 backdrop-blur-xl px-3 py-1.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center gap-1 border border-white/50">
                            <span className="text-xs font-bold text-gray-400 mr-1">from</span>
                            <span className="text-lg font-display font-extrabold text-purple-600">£35</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 pb-8 pt-4 flex flex-col flex-grow">
              <div className="mb-4">
                  <h3 className="text-2xl font-bold font-display text-gray-900 mb-2">Grooming</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Full spa treatment. Wash, cut, fluff and nail clipping.</p>
              </div>

               <ul className="space-y-2 mb-6 flex-grow">
                 <li className="flex items-center gap-3 text-gray-700 text-sm"><Check size={16} className="text-purple-500 shrink-0" /> <span>Organic shampoos</span></li>
                 <li className="flex items-center gap-3 text-gray-700 text-sm"><Check size={16} className="text-purple-500 shrink-0" /> <span>Nail clipping included</span></li>
              </ul>

              <div className="mt-auto pt-6 border-t border-gray-100">
                 <button 
                    onClick={() => handleBookService({
                      id: 'svc-groom-full', name: 'Full Groom', price: 35, category: 'snack', 
                      image: '/images/services/grooming.jpg', 
                      description: 'Full wash, cut and dry'
                    })}
                  className="w-full py-3.5 rounded-xl bg-gray-900 hover:bg-purple-600 text-white font-bold shadow-lg transition-colors flex items-center justify-center gap-2 group/btn"
                >
                  <span>Book Now</span>
                  <Calendar size={18} className="text-gray-400 group-hover/btn:text-white" />
                </button>
              </div>
            </div>
          </div>

           {/* 5. PUPPY TRAINING */}
           <div className="bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_50px_-12px_rgba(59,130,246,0.25)] transition-all duration-300 hover:-translate-y-2 border border-gray-100 flex flex-col group h-full">
             {/* FRAMED IMAGE CONTAINER - Reverted to h-72, object-contain */}
             <div className="h-72 p-5 bg-blue-50">
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-sm border border-black/5 bg-white flex items-center justify-center">
                    <img 
                        src="/images/services/training.jpg" 
                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80"; }}
                        alt="Puppy Training" 
                        className="w-full h-full object-contain transform transition-transform duration-700 hover:scale-105" 
                    />
                    {/* INTEGRATED PRICE BADGE */}
                    <div className="absolute bottom-3 right-3 z-20">
                        <div className="bg-white/95 backdrop-blur-xl px-3 py-1.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center gap-1 border border-white/50">
                            <span className="text-xs font-bold text-gray-400 mr-1">/ hr</span>
                            <span className="text-lg font-display font-extrabold text-blue-600">£40</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 pb-8 pt-4 flex flex-col flex-grow">
               <div className="mb-4">
                  <h3 className="text-2xl font-bold font-display text-gray-900 mb-2">Training</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Positive reinforcement techniques to help your puppy learn fast.</p>
              </div>

               <ul className="space-y-2 mb-6 flex-grow">
                 <li className="flex items-center gap-3 text-gray-700 text-sm"><Check size={16} className="text-blue-500 shrink-0" /> <span>Basic Commands</span></li>
                 <li className="flex items-center gap-3 text-gray-700 text-sm"><Check size={16} className="text-blue-500 shrink-0" /> <span>Socialization skills</span></li>
              </ul>

              <div className="mt-auto pt-6 border-t border-gray-100">
                 <button 
                    onClick={() => handleBookService({
                      id: 'svc-train-1hr', name: 'Training Session', price: 40, category: 'snack', 
                      image: '/images/services/training.jpg', 
                      description: '1 Hour Training Session'
                    })}
                  className="w-full py-3.5 rounded-xl bg-gray-900 hover:bg-blue-600 text-white font-bold shadow-lg transition-colors flex items-center justify-center gap-2 group/btn"
                >
                  <span>Book Now</span>
                  <Calendar size={18} className="text-gray-400 group-hover/btn:text-white" />
                </button>
              </div>
            </div>
          </div>

           {/* 6. DOG MINDING */}
           <div className="bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_50px_-12px_rgba(0,194,203,0.25)] transition-all duration-300 hover:-translate-y-2 border border-gray-100 flex flex-col group h-full">
             {/* FRAMED IMAGE CONTAINER - Reverted to h-72, object-contain */}
             <div className="h-72 p-5 bg-brand-teal/5">
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-sm border border-black/5 bg-white flex items-center justify-center">
                    <img 
                        src="/images/services/pop-in.jpg" 
                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80"; }}
                        alt="Pet Minding" 
                        className="w-full h-full object-contain transform transition-transform duration-700 hover:scale-105" 
                    />
                    {/* INTEGRATED PRICE BADGE */}
                    <div className="absolute bottom-3 right-3 z-20">
                        <div className="bg-white/95 backdrop-blur-xl px-3 py-1.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center gap-1 border border-white/50">
                            <span className="text-xs font-bold text-gray-400 mr-1">visit</span>
                            <span className="text-lg font-display font-extrabold text-brand-teal">£12</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 pb-8 pt-4 flex flex-col flex-grow">
               <div className="mb-4">
                  <h3 className="text-2xl font-bold font-display text-gray-900 mb-2">Pop-in Visits</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Short visits for feed, garden breaks, and play. Perfect for puppies.</p>
              </div>

               <ul className="space-y-2 mb-6 flex-grow">
                 <li className="flex items-center gap-3 text-gray-700 text-sm"><Check size={16} className="text-brand-teal shrink-0" /> <span>Garden breaks</span></li>
                 <li className="flex items-center gap-3 text-gray-700 text-sm"><Check size={16} className="text-brand-teal shrink-0" /> <span>Feed & Water check</span></li>
              </ul>

              <div className="mt-auto pt-6 border-t border-gray-100">
                 <button 
                    onClick={() => handleBookService({
                      id: 'svc-mind-30', name: 'Pop-in Visit', price: 12, category: 'snack', 
                      image: '/images/services/pop-in.jpg', 
                      description: '30 minute home visit'
                    })}
                  className="w-full py-3.5 rounded-xl bg-gray-900 hover:bg-brand-teal text-white font-bold shadow-lg transition-colors flex items-center justify-center gap-2 group/btn"
                >
                  <span>Book Now</span>
                  <Calendar size={18} className="text-gray-400 group-hover/btn:text-white" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};