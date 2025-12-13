import React from 'react';
import { Dog, Home, Sun, Heart, Star, Check, ArrowRight } from 'lucide-react';
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
          <span className="text-brand-pink font-bold tracking-widest uppercase text-sm">Professional Care</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-dark mb-6 mt-2">
            Our Premium Services
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
            Fully insured and APHA approved. From quick visits to long-term vacation care, 
            choose the perfect plan for your furry friend below.
          </p>
          <div className="mt-6 h-1.5 w-24 rounded-full bg-brand-orange mx-auto"></div>
        </div>
        
        {/* Services Grid - 2x2 Layout for better visibility on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          
          {/* 1. DOG WALKING */}
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col group">
            <div className="relative h-64 overflow-hidden">
              <div className="absolute inset-0 bg-brand-teal/20 group-hover:bg-transparent transition-colors z-10"></div>
              {/* Image */}
              <img src="https://images.unsplash.com/photo-1605639148518-e7d6928d1c33?auto=format&fit=crop&w=800&q=80" alt="Dog Walking" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
              {/* Icon Badge */}
              <div className="absolute bottom-4 left-4 z-20 w-14 h-14 rounded-2xl bg-brand-teal text-white flex items-center justify-center shadow-lg">
                <Dog size={28} />
              </div>
              {/* Popular Tag */}
              <div className="absolute top-4 right-4 z-20 bg-brand-orange text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                <Star size={12} fill="currentColor" /> POPULAR
              </div>
            </div>
            
            <div className="p-8 flex flex-col flex-grow">
              <h3 className="text-2xl font-bold font-display text-gray-900 mb-2">Dog Walking</h3>
              <p className="text-gray-500 mb-6 text-sm">Energizing walks in safe, green spaces.</p>
              
              <ul className="space-y-2 mb-8 flex-grow">
                 <li className="flex items-center gap-2 text-gray-700 text-sm"><Check size={16} className="text-brand-teal" /> <span>GPS Tracked Walks</span></li>
                 <li className="flex items-center gap-2 text-gray-700 text-sm"><Check size={16} className="text-brand-teal" /> <span>Fresh water & paw cleaning</span></li>
                 <li className="flex items-center gap-2 text-gray-700 text-sm"><Check size={16} className="text-brand-teal" /> <span>Photo updates included</span></li>
              </ul>

              <div className="space-y-3 mt-auto">
                <button 
                  onClick={() => handleBookService({
                    id: 'svc-walk-solo', name: 'Solo Dog Walk (1hr)', price: 20, category: 'snack', 
                    image: 'https://images.unsplash.com/photo-1605639148518-e7d6928d1c33?auto=format&fit=crop&w=500&q=80', 
                    description: 'One hour solo walk'
                  })}
                  className="w-full flex justify-between items-center p-4 rounded-xl bg-gray-50 hover:bg-brand-light border border-gray-100 hover:border-brand-teal transition-all group/btn"
                >
                  <span className="font-bold text-gray-700">Solo Walk (1hr)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-dark">£20</span>
                    <ArrowRight size={16} className="text-gray-400 group-hover/btn:text-brand-teal" />
                  </div>
                </button>

                <button 
                  onClick={() => handleBookService({
                    id: 'svc-walk-group', name: 'Group Adventure (1hr)', price: 15, category: 'snack', 
                    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500&q=80', 
                    description: 'Group adventure walk'
                  })}
                  className="w-full flex justify-between items-center p-4 rounded-xl bg-gray-50 hover:bg-brand-light border border-gray-100 hover:border-brand-teal transition-all group/btn"
                >
                  <span className="font-bold text-gray-700">Group Walk (1hr)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-dark">£15</span>
                    <ArrowRight size={16} className="text-gray-400 group-hover/btn:text-brand-teal" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* 2. DOG SITTING (Home Boarding) */}
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col group">
            <div className="relative h-64 overflow-hidden">
              <div className="absolute inset-0 bg-brand-pink/20 group-hover:bg-transparent transition-colors z-10"></div>
              <img src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80" alt="Dog Sitting" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute bottom-4 left-4 z-20 w-14 h-14 rounded-2xl bg-brand-pink text-white flex items-center justify-center shadow-lg">
                <Home size={28} />
              </div>
            </div>

            <div className="p-8 flex flex-col flex-grow">
              <h3 className="text-2xl font-bold font-display text-gray-900 mb-2">Home Sitting</h3>
              <p className="text-gray-500 mb-6 text-sm">Comfort and companionship in your own home.</p>

               <ul className="space-y-2 mb-8 flex-grow">
                 <li className="flex items-center gap-2 text-gray-700 text-sm"><Check size={16} className="text-brand-pink" /> <span>Maintains their routine</span></li>
                 <li className="flex items-center gap-2 text-gray-700 text-sm"><Check size={16} className="text-brand-pink" /> <span>Feeding & medication included</span></li>
                 <li className="flex items-center gap-2 text-gray-700 text-sm"><Check size={16} className="text-brand-pink" /> <span>Constant cuddles</span></li>
              </ul>

              <div className="space-y-3 mt-auto">
                 <button 
                     onClick={() => handleBookService({
                      id: 'svc-sit-12', name: 'Day Sitting (12 Hours)', price: 35, category: 'snack', 
                      image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=500&q=80', 
                      description: '12 Hour in-home sitting'
                    })}
                  className="w-full flex justify-between items-center p-4 rounded-xl bg-gray-50 hover:bg-brand-light border border-gray-100 hover:border-brand-pink transition-all group/btn"
                >
                  <span className="font-bold text-gray-700">Day Care (12 hrs)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-dark">£35</span>
                    <ArrowRight size={16} className="text-gray-400 group-hover/btn:text-brand-pink" />
                  </div>
                </button>

                 <button 
                     onClick={() => handleBookService({
                      id: 'svc-sit-24', name: 'Overnight Sitting (24 Hours)', price: 45, category: 'snack', 
                      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80', 
                      description: 'Full day and night care'
                    })}
                  className="w-full flex justify-between items-center p-4 rounded-xl bg-gray-50 hover:bg-brand-light border border-gray-100 hover:border-brand-pink transition-all group/btn"
                >
                  <span className="font-bold text-gray-700">Overnight (24 hrs)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-dark">£45</span>
                    <ArrowRight size={16} className="text-gray-400 group-hover/btn:text-brand-pink" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* 3. VACATION CARE */}
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-brand-yellow/30 flex flex-col group relative">
             <div className="absolute top-4 right-4 z-20 bg-brand-yellow text-brand-dark text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                PREMIUM
             </div>
             
             <div className="relative h-64 overflow-hidden">
              <div className="absolute inset-0 bg-brand-yellow/20 group-hover:bg-transparent transition-colors z-10"></div>
              <img src="https://images.unsplash.com/photo-1575485670541-82a2b0cb0e25?auto=format&fit=crop&w=800&q=80" alt="Vacation Care" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute bottom-4 left-4 z-20 w-14 h-14 rounded-2xl bg-brand-yellow text-white flex items-center justify-center shadow-lg">
                <Sun size={28} />
              </div>
            </div>

            <div className="p-8 flex flex-col flex-grow">
              <h3 className="text-2xl font-bold font-display text-gray-900 mb-2">Vacation Care</h3>
              <p className="text-gray-500 mb-6 text-sm">Long-term loving care while you travel.</p>

               <ul className="space-y-2 mb-8 flex-grow">
                 <li className="flex items-center gap-2 text-gray-700 text-sm"><Check size={16} className="text-brand-yellow" /> <span>Home-away-from-home</span></li>
                 <li className="flex items-center gap-2 text-gray-700 text-sm"><Check size={16} className="text-brand-yellow" /> <span>Daily video calls included</span></li>
                 <li className="flex items-center gap-2 text-gray-700 text-sm"><Check size={16} className="text-brand-yellow" /> <span>Beach trips included</span></li>
              </ul>

              <div className="space-y-3 mt-auto">
                 <button 
                  onClick={scrollToContact}
                  className="w-full bg-brand-dark text-white font-bold py-4 rounded-xl shadow-lg hover:bg-brand-orange transition-all flex items-center justify-center gap-2"
                 >
                   <span>Get a Custom Quote</span>
                   <ArrowRight size={18} />
                 </button>
                 <p className="text-center text-xs text-gray-400 mt-2">Starting from £40 / night</p>
              </div>
            </div>
          </div>

           {/* 4. DOG MINDING (Drop-ins) */}
           <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col group">
             <div className="relative h-64 overflow-hidden">
              <div className="absolute inset-0 bg-brand-teal/20 group-hover:bg-transparent transition-colors z-10"></div>
              <img src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80" alt="Pet Minding" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute bottom-4 left-4 z-20 w-14 h-14 rounded-2xl bg-brand-teal text-white flex items-center justify-center shadow-lg">
                <Heart size={28} />
              </div>
            </div>

            <div className="p-8 flex flex-col flex-grow">
              <h3 className="text-2xl font-bold font-display text-gray-900 mb-2">Dog Minding</h3>
              <p className="text-gray-500 mb-6 text-sm">Short visits for puppies or seniors.</p>

               <ul className="space-y-2 mb-8 flex-grow">
                 <li className="flex items-center gap-2 text-gray-700 text-sm"><Check size={16} className="text-brand-teal" /> <span>Garden breaks & clean up</span></li>
                 <li className="flex items-center gap-2 text-gray-700 text-sm"><Check size={16} className="text-brand-teal" /> <span>Feeding & playtime</span></li>
                 <li className="flex items-center gap-2 text-gray-700 text-sm"><Check size={16} className="text-brand-teal" /> <span>Perfect for working owners</span></li>
              </ul>

              <div className="space-y-3 mt-auto">
                 <button 
                    onClick={() => handleBookService({
                      id: 'svc-mind-30', name: 'Pop-in Visit (30 mins)', price: 12, category: 'snack', 
                      image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=500&q=80', 
                      description: '30 minute home visit'
                    })}
                  className="w-full flex justify-between items-center p-4 rounded-xl bg-gray-50 hover:bg-brand-light border border-gray-100 hover:border-brand-teal transition-all group/btn"
                >
                  <span className="font-bold text-gray-700">Pop-in (30 mins)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-dark">£12</span>
                    <ArrowRight size={16} className="text-gray-400 group-hover/btn:text-brand-teal" />
                  </div>
                </button>

                 <button 
                    onClick={() => handleBookService({
                      id: 'svc-mind-60', name: 'Extended Visit (1 hr)', price: 18, category: 'snack', 
                      image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=500&q=80', 
                      description: '1 hour home visit'
                    })}
                  className="w-full flex justify-between items-center p-4 rounded-xl bg-gray-50 hover:bg-brand-light border border-gray-100 hover:border-brand-teal transition-all group/btn"
                >
                  <span className="font-bold text-gray-700">Extended (1 hr)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-dark">£18</span>
                    <ArrowRight size={16} className="text-gray-400 group-hover/btn:text-brand-teal" />
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