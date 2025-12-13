import React from 'react';
import { Dog, Home, Sun, Heart, Star, Check, ArrowRight, Scissors, GraduationCap } from 'lucide-react';
import { Product } from '../types';

interface ServicesProps {
  addToCart?: (product: Product) => void;
}

export const Services: React.FC<ServicesProps> = ({ addToCart }) => {
  
  // Helper to scroll to contact for custom quotes
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Helper to add a service to cart safely
  const handleBookService = (serviceProduct: Product) => {
    if (addToCart) {
      addToCart(serviceProduct);
    }
  };

  return (
    <div className="relative py-20 bg-brand-light" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Intro Section */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <span className="text-brand-pink font-bold tracking-widest uppercase text-sm">Full Service Care</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-dark mb-6 mt-2">
            Our 6 Premium Services
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
            Everything your dog needs under one roof. Fully insured, APHA approved, and delivered with love.
          </p>
          <div className="mt-6 h-1.5 w-24 rounded-full bg-brand-orange mx-auto"></div>
        </div>
        
        {/* Services Grid - 2 columns on desktop for large cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* 1. DOG WALKING */}
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col group h-full">
            <div className="relative h-56 overflow-hidden">
              <div className="absolute inset-0 bg-brand-teal/20 group-hover:bg-transparent transition-colors z-10"></div>
              <img src="https://images.unsplash.com/photo-1605639148518-e7d6928d1c33?auto=format&fit=crop&w=800&q=80" alt="Dog Walking" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute bottom-4 left-4 z-20 w-12 h-12 rounded-2xl bg-brand-teal text-white flex items-center justify-center shadow-lg">
                <Dog size={24} />
              </div>
              <div className="absolute top-4 right-4 z-20 bg-brand-orange text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Star size={10} fill="currentColor" /> POPULAR
              </div>
            </div>
            
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold font-display text-gray-900 mb-2">Dog Walking</h3>
              <p className="text-gray-500 mb-4 text-sm">Energizing walks in safe, green spaces.</p>
              
              <ul className="space-y-2 mb-6 flex-grow">
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-brand-teal" /> <span>GPS Tracked</span></li>
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-brand-teal" /> <span>Photo updates</span></li>
              </ul>

              <div className="mt-auto pt-4 border-t border-gray-100">
                <button 
                  onClick={() => handleBookService({
                    id: 'svc-walk-group', name: 'Group Walk (1hr)', price: 15, category: 'snack', 
                    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500&q=80', 
                    description: 'Group adventure walk'
                  })}
                  className="w-full flex justify-between items-center p-3 rounded-xl bg-gray-50 hover:bg-brand-light hover:text-brand-teal transition-colors group/btn"
                >
                  <span className="font-bold text-gray-700 text-sm">Book Walk</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-brand-dark">£15</span>
                    <ArrowRight size={14} />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* 2. DOG SITTING */}
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col group h-full">
            <div className="relative h-56 overflow-hidden">
              <div className="absolute inset-0 bg-brand-pink/20 group-hover:bg-transparent transition-colors z-10"></div>
              <img src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80" alt="Dog Sitting" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute bottom-4 left-4 z-20 w-12 h-12 rounded-2xl bg-brand-pink text-white flex items-center justify-center shadow-lg">
                <Home size={24} />
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold font-display text-gray-900 mb-2">Home Sitting</h3>
              <p className="text-gray-500 mb-4 text-sm">Comfort in your own home.</p>

               <ul className="space-y-2 mb-6 flex-grow">
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-brand-pink" /> <span>Routine maintained</span></li>
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-brand-pink" /> <span>Overnight stays</span></li>
              </ul>

              <div className="mt-auto pt-4 border-t border-gray-100">
                 <button 
                     onClick={() => handleBookService({
                      id: 'svc-sit-24', name: 'Overnight Sitting', price: 45, category: 'snack', 
                      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80', 
                      description: 'Full day and night care'
                    })}
                  className="w-full flex justify-between items-center p-3 rounded-xl bg-gray-50 hover:bg-brand-light hover:text-brand-pink transition-colors group/btn"
                >
                  <span className="font-bold text-gray-700 text-sm">Book Night</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-brand-dark">£45</span>
                    <ArrowRight size={14} />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* 3. VACATION CARE */}
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-brand-yellow/30 flex flex-col group h-full">
             <div className="relative h-56 overflow-hidden">
              <div className="absolute inset-0 bg-brand-yellow/20 group-hover:bg-transparent transition-colors z-10"></div>
              <img src="https://images.unsplash.com/photo-1575485670541-82a2b0cb0e25?auto=format&fit=crop&w=800&q=80" alt="Vacation Care" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute bottom-4 left-4 z-20 w-12 h-12 rounded-2xl bg-brand-yellow text-white flex items-center justify-center shadow-lg">
                <Sun size={24} />
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold font-display text-gray-900 mb-2">Vacation Care</h3>
              <p className="text-gray-500 mb-4 text-sm">Long-term loving care while you travel.</p>

               <ul className="space-y-2 mb-6 flex-grow">
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-brand-yellow" /> <span>Home-away-from-home</span></li>
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-brand-yellow" /> <span>Video calls</span></li>
              </ul>

              <div className="mt-auto pt-4 border-t border-gray-100">
                 <button 
                  onClick={scrollToContact}
                  className="w-full bg-brand-dark text-white text-sm font-bold py-3 rounded-xl shadow hover:bg-brand-orange transition-all flex items-center justify-center gap-2"
                 >
                   <span>Get Quote</span>
                   <ArrowRight size={14} />
                 </button>
              </div>
            </div>
          </div>

           {/* 4. DOG GROOMING (RESTORED) */}
           <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col group h-full">
             <div className="relative h-56 overflow-hidden">
              <div className="absolute inset-0 bg-purple-100/50 group-hover:bg-transparent transition-colors z-10"></div>
              <img src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80" alt="Dog Grooming" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute bottom-4 left-4 z-20 w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center shadow-lg">
                <Scissors size={24} />
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold font-display text-gray-900 mb-2">Grooming</h3>
              <p className="text-gray-500 mb-4 text-sm">Wash, cut, and fluff for a fresh pup.</p>

               <ul className="space-y-2 mb-6 flex-grow">
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-purple-500" /> <span>Bath & Blow Dry</span></li>
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-purple-500" /> <span>Nail Clipping</span></li>
              </ul>

              <div className="mt-auto pt-4 border-t border-gray-100">
                 <button 
                    onClick={() => handleBookService({
                      id: 'svc-groom-full', name: 'Full Groom', price: 35, category: 'snack', 
                      image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=500&q=80', 
                      description: 'Full wash, cut and dry'
                    })}
                  className="w-full flex justify-between items-center p-3 rounded-xl bg-gray-50 hover:bg-purple-50 hover:text-purple-600 transition-colors group/btn"
                >
                  <span className="font-bold text-gray-700 text-sm">Full Groom</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-brand-dark">£35</span>
                    <ArrowRight size={14} />
                  </div>
                </button>
              </div>
            </div>
          </div>

           {/* 5. PUPPY TRAINING (RESTORED) */}
           <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col group h-full">
             <div className="relative h-56 overflow-hidden">
              <div className="absolute inset-0 bg-blue-100/50 group-hover:bg-transparent transition-colors z-10"></div>
              <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80" alt="Puppy Training" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute bottom-4 left-4 z-20 w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg">
                <GraduationCap size={24} />
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold font-display text-gray-900 mb-2">Training</h3>
              <p className="text-gray-500 mb-4 text-sm">Positive reinforcement for puppies.</p>

               <ul className="space-y-2 mb-6 flex-grow">
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-blue-500" /> <span>Basic Commands</span></li>
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-blue-500" /> <span>Socialization</span></li>
              </ul>

              <div className="mt-auto pt-4 border-t border-gray-100">
                 <button 
                    onClick={() => handleBookService({
                      id: 'svc-train-1hr', name: 'Training Session', price: 40, category: 'snack', 
                      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=500&q=80', 
                      description: '1 Hour Training Session'
                    })}
                  className="w-full flex justify-between items-center p-3 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors group/btn"
                >
                  <span className="font-bold text-gray-700 text-sm">1 Session</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-brand-dark">£40</span>
                    <ArrowRight size={14} />
                  </div>
                </button>
              </div>
            </div>
          </div>

           {/* 6. DOG MINDING (Drop-ins) */}
           <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col group h-full">
             <div className="relative h-56 overflow-hidden">
              <div className="absolute inset-0 bg-brand-teal/20 group-hover:bg-transparent transition-colors z-10"></div>
              <img src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80" alt="Pet Minding" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute bottom-4 left-4 z-20 w-12 h-12 rounded-2xl bg-brand-teal text-white flex items-center justify-center shadow-lg">
                <Heart size={24} />
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold font-display text-gray-900 mb-2">Pop-in Visits</h3>
              <p className="text-gray-500 mb-4 text-sm">Short visits for feed & play.</p>

               <ul className="space-y-2 mb-6 flex-grow">
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-brand-teal" /> <span>Garden breaks</span></li>
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-brand-teal" /> <span>Puppy care</span></li>
              </ul>

              <div className="mt-auto pt-4 border-t border-gray-100">
                 <button 
                    onClick={() => handleBookService({
                      id: 'svc-mind-30', name: 'Pop-in Visit', price: 12, category: 'snack', 
                      image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=500&q=80', 
                      description: '30 minute home visit'
                    })}
                  className="w-full flex justify-between items-center p-3 rounded-xl bg-gray-50 hover:bg-brand-light hover:text-brand-teal transition-colors group/btn"
                >
                  <span className="font-bold text-gray-700 text-sm">Pop-in</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-brand-dark">£12</span>
                    <ArrowRight size={14} />
                  </div>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};