import React from 'react';
import { Dog, Home, Sun, Heart, Star, Check, ArrowRight, Scissors, GraduationCap } from 'lucide-react';
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

  // Helper to handle missing images gracefully
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://placehold.co/800x600/E0F7FA/00838F?text=Service+Image";
  };

  return (
    <div className="relative py-12 md:py-20 bg-brand-light" id="services">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Intro Section */}
        <div className="text-center mb-10 md:mb-16 max-w-4xl mx-auto">
          <span className="text-brand-pink font-bold tracking-widest uppercase text-xs md:text-sm">Full Service Care</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-brand-dark mb-3 md:mb-6 mt-2">
            Our Services
          </h2>
          <p className="text-sm md:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto px-2">
            Everything your dog needs. Fully insured & approved.
          </p>
          <div className="mt-4 md:mt-6 h-1 w-16 md:w-24 rounded-full bg-brand-orange mx-auto"></div>
        </div>
        
        {/* Services Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
          
          {/* 1. DOG WALKING */}
          <div className="bg-white rounded-2xl md:rounded-[2rem] overflow-hidden shadow-md md:shadow-xl border border-gray-100 flex flex-col group h-full active:scale-[0.98] transition-transform duration-200">
            <div className="relative h-32 md:h-56 overflow-hidden">
              <div className="absolute inset-0 bg-brand-teal/20 md:group-hover:bg-transparent transition-colors z-10"></div>
              <img 
                src="/images/services/walking.jpg" 
                onError={(e) => {
                    // Fallback to Unsplash if local image is missing
                    e.currentTarget.src = "https://images.unsplash.com/photo-1605639148518-e7d6928d1c33?auto=format&fit=crop&w=800&q=80";
                }}
                alt="Dog Walking" 
                className="w-full h-full object-cover transform md:group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 z-20 w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl bg-brand-teal text-white flex items-center justify-center shadow-lg">
                <Dog size={16} className="md:w-6 md:h-6" />
              </div>
              <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20 bg-brand-orange text-white text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-full shadow-lg flex items-center gap-1">
                <Star size={8} className="md:w-[10px]" fill="currentColor" /> POPULAR
              </div>
            </div>
            
            <div className="p-3 md:p-6 flex flex-col flex-grow">
              <h3 className="text-sm md:text-xl font-bold font-display text-gray-900 mb-1 md:mb-2 truncate">Dog Walking</h3>
              <p className="text-gray-500 mb-2 md:mb-4 text-[10px] md:text-sm line-clamp-2">Energizing walks in safe, green spaces.</p>
              
              <ul className="space-y-1 mb-3 flex-grow hidden md:block">
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-brand-teal" /> <span>GPS Tracked</span></li>
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-brand-teal" /> <span>Photo updates</span></li>
              </ul>

              <div className="mt-auto pt-2 md:pt-4 border-t border-gray-100">
                <button 
                  onClick={() => handleBookService({
                    id: 'svc-walk-group', name: 'Group Walk', price: 15, category: 'snack', 
                    image: '/images/services/walking.jpg', // Used for cart thumbnail
                    description: 'Group adventure walk'
                  })}
                  className="w-full flex justify-between items-center p-2 md:p-3 rounded-lg md:rounded-xl bg-gray-50 hover:bg-brand-light hover:text-brand-teal transition-colors"
                >
                  <span className="font-bold text-gray-700 text-xs md:text-sm">Book</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-brand-dark text-xs md:text-base">£15</span>
                    <ArrowRight size={12} className="md:w-[14px]" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* 2. DOG SITTING */}
          <div className="bg-white rounded-2xl md:rounded-[2rem] overflow-hidden shadow-md md:shadow-xl border border-gray-100 flex flex-col group h-full active:scale-[0.98] transition-transform duration-200">
            <div className="relative h-32 md:h-56 overflow-hidden">
              <div className="absolute inset-0 bg-brand-pink/20 md:group-hover:bg-transparent transition-colors z-10"></div>
              <img 
                src="/images/services/sitting.jpg" 
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80"; }}
                alt="Dog Sitting" 
                className="w-full h-full object-cover transform md:group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 z-20 w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl bg-brand-pink text-white flex items-center justify-center shadow-lg">
                <Home size={16} className="md:w-6 md:h-6" />
              </div>
            </div>

            <div className="p-3 md:p-6 flex flex-col flex-grow">
              <h3 className="text-sm md:text-xl font-bold font-display text-gray-900 mb-1 md:mb-2 truncate">Home Sitting</h3>
              <p className="text-gray-500 mb-2 md:mb-4 text-[10px] md:text-sm line-clamp-2">Comfort in your own home.</p>

               <ul className="space-y-1 mb-3 flex-grow hidden md:block">
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-brand-pink" /> <span>Routine maintained</span></li>
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-brand-pink" /> <span>Overnight stays</span></li>
              </ul>

              <div className="mt-auto pt-2 md:pt-4 border-t border-gray-100">
                 <button 
                     onClick={() => handleBookService({
                      id: 'svc-sit-24', name: 'Overnight Sitting', price: 45, category: 'snack', 
                      image: '/images/services/sitting.jpg', 
                      description: 'Full day and night care'
                    })}
                  className="w-full flex justify-between items-center p-2 md:p-3 rounded-lg md:rounded-xl bg-gray-50 hover:bg-brand-light hover:text-brand-pink transition-colors"
                >
                  <span className="font-bold text-gray-700 text-xs md:text-sm">Book</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-brand-dark text-xs md:text-base">£45</span>
                    <ArrowRight size={12} className="md:w-[14px]" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* 3. VACATION CARE */}
          <div className="bg-white rounded-2xl md:rounded-[2rem] overflow-hidden shadow-md md:shadow-xl border-2 border-brand-yellow/30 flex flex-col group h-full active:scale-[0.98] transition-transform duration-200">
             <div className="relative h-32 md:h-56 overflow-hidden">
              <div className="absolute inset-0 bg-brand-yellow/20 md:group-hover:bg-transparent transition-colors z-10"></div>
              <img 
                src="/images/services/vacation.jpg" 
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1575485670541-82a2b0cb0e25?auto=format&fit=crop&w=800&q=80"; }}
                alt="Vacation Care" 
                className="w-full h-full object-cover transform md:group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 z-20 w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl bg-brand-yellow text-white flex items-center justify-center shadow-lg">
                <Sun size={16} className="md:w-6 md:h-6" />
              </div>
            </div>

            <div className="p-3 md:p-6 flex flex-col flex-grow">
              <h3 className="text-sm md:text-xl font-bold font-display text-gray-900 mb-1 md:mb-2 truncate">Vacation</h3>
              <p className="text-gray-500 mb-2 md:mb-4 text-[10px] md:text-sm line-clamp-2">Long-term loving care.</p>

               <ul className="space-y-1 mb-3 flex-grow hidden md:block">
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-brand-yellow" /> <span>Home-away-from-home</span></li>
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-brand-yellow" /> <span>Video calls</span></li>
              </ul>

              <div className="mt-auto pt-2 md:pt-4 border-t border-gray-100">
                 <button 
                  onClick={scrollToContact}
                  className="w-full bg-brand-dark text-white text-[10px] md:text-sm font-bold py-2 md:py-3 rounded-lg md:rounded-xl shadow hover:bg-brand-orange transition-all flex items-center justify-center gap-1 md:gap-2"
                 >
                   <span>Get Quote</span>
                   <ArrowRight size={12} className="md:w-[14px]" />
                 </button>
              </div>
            </div>
          </div>

           {/* 4. DOG GROOMING */}
           <div className="bg-white rounded-2xl md:rounded-[2rem] overflow-hidden shadow-md md:shadow-xl border border-gray-100 flex flex-col group h-full active:scale-[0.98] transition-transform duration-200">
             <div className="relative h-32 md:h-56 overflow-hidden">
              <div className="absolute inset-0 bg-purple-100/50 md:group-hover:bg-transparent transition-colors z-10"></div>
              <img 
                src="/images/services/grooming.jpg" 
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80"; }}
                alt="Dog Grooming" 
                className="w-full h-full object-cover transform md:group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 z-20 w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl bg-purple-500 text-white flex items-center justify-center shadow-lg">
                <Scissors size={16} className="md:w-6 md:h-6" />
              </div>
            </div>

            <div className="p-3 md:p-6 flex flex-col flex-grow">
              <h3 className="text-sm md:text-xl font-bold font-display text-gray-900 mb-1 md:mb-2 truncate">Grooming</h3>
              <p className="text-gray-500 mb-2 md:mb-4 text-[10px] md:text-sm line-clamp-2">Wash, cut, and fluff.</p>

               <ul className="space-y-1 mb-3 flex-grow hidden md:block">
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-purple-500" /> <span>Bath & Blow Dry</span></li>
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-purple-500" /> <span>Nail Clipping</span></li>
              </ul>

              <div className="mt-auto pt-2 md:pt-4 border-t border-gray-100">
                 <button 
                    onClick={() => handleBookService({
                      id: 'svc-groom-full', name: 'Full Groom', price: 35, category: 'snack', 
                      image: '/images/services/grooming.jpg', 
                      description: 'Full wash, cut and dry'
                    })}
                  className="w-full flex justify-between items-center p-2 md:p-3 rounded-lg md:rounded-xl bg-gray-50 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                >
                  <span className="font-bold text-gray-700 text-xs md:text-sm">Book</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-brand-dark text-xs md:text-base">£35</span>
                    <ArrowRight size={12} className="md:w-[14px]" />
                  </div>
                </button>
              </div>
            </div>
          </div>

           {/* 5. PUPPY TRAINING */}
           <div className="bg-white rounded-2xl md:rounded-[2rem] overflow-hidden shadow-md md:shadow-xl border border-gray-100 flex flex-col group h-full active:scale-[0.98] transition-transform duration-200">
             <div className="relative h-32 md:h-56 overflow-hidden">
              <div className="absolute inset-0 bg-blue-100/50 md:group-hover:bg-transparent transition-colors z-10"></div>
              <img 
                src="/images/services/training.jpg" 
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80"; }}
                alt="Puppy Training" 
                className="w-full h-full object-cover transform md:group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 z-20 w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg">
                <GraduationCap size={16} className="md:w-6 md:h-6" />
              </div>
            </div>

            <div className="p-3 md:p-6 flex flex-col flex-grow">
              <h3 className="text-sm md:text-xl font-bold font-display text-gray-900 mb-1 md:mb-2 truncate">Training</h3>
              <p className="text-gray-500 mb-2 md:mb-4 text-[10px] md:text-sm line-clamp-2">Positive reinforcement.</p>

               <ul className="space-y-1 mb-3 flex-grow hidden md:block">
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-blue-500" /> <span>Basic Commands</span></li>
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-blue-500" /> <span>Socialization</span></li>
              </ul>

              <div className="mt-auto pt-2 md:pt-4 border-t border-gray-100">
                 <button 
                    onClick={() => handleBookService({
                      id: 'svc-train-1hr', name: 'Training Session', price: 40, category: 'snack', 
                      image: '/images/services/training.jpg', 
                      description: '1 Hour Training Session'
                    })}
                  className="w-full flex justify-between items-center p-2 md:p-3 rounded-lg md:rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <span className="font-bold text-gray-700 text-xs md:text-sm">Book</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-brand-dark text-xs md:text-base">£40</span>
                    <ArrowRight size={12} className="md:w-[14px]" />
                  </div>
                </button>
              </div>
            </div>
          </div>

           {/* 6. DOG MINDING */}
           <div className="bg-white rounded-2xl md:rounded-[2rem] overflow-hidden shadow-md md:shadow-xl border border-gray-100 flex flex-col group h-full active:scale-[0.98] transition-transform duration-200">
             <div className="relative h-32 md:h-56 overflow-hidden">
              <div className="absolute inset-0 bg-brand-teal/20 md:group-hover:bg-transparent transition-colors z-10"></div>
              <img 
                src="/images/services/pop-in.jpg" 
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80"; }}
                alt="Pet Minding" 
                className="w-full h-full object-cover transform md:group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 z-20 w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl bg-brand-teal text-white flex items-center justify-center shadow-lg">
                <Heart size={16} className="md:w-6 md:h-6" />
              </div>
            </div>

            <div className="p-3 md:p-6 flex flex-col flex-grow">
              <h3 className="text-sm md:text-xl font-bold font-display text-gray-900 mb-1 md:mb-2 truncate">Pop-in Visits</h3>
              <p className="text-gray-500 mb-2 md:mb-4 text-[10px] md:text-sm line-clamp-2">Short visits for feed & play.</p>

               <ul className="space-y-1 mb-3 flex-grow hidden md:block">
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-brand-teal" /> <span>Garden breaks</span></li>
                 <li className="flex items-center gap-2 text-gray-700 text-xs"><Check size={14} className="text-brand-teal" /> <span>Puppy care</span></li>
              </ul>

              <div className="mt-auto pt-2 md:pt-4 border-t border-gray-100">
                 <button 
                    onClick={() => handleBookService({
                      id: 'svc-mind-30', name: 'Pop-in Visit', price: 12, category: 'snack', 
                      image: '/images/services/pop-in.jpg', 
                      description: '30 minute home visit'
                    })}
                  className="w-full flex justify-between items-center p-2 md:p-3 rounded-lg md:rounded-xl bg-gray-50 hover:bg-brand-light hover:text-brand-teal transition-colors"
                >
                  <span className="font-bold text-gray-700 text-xs md:text-sm">Book</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-brand-dark text-xs md:text-base">£12</span>
                    <ArrowRight size={12} className="md:w-[14px]" />
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