import React from 'react';
import { Dog, Home, Sun, Heart } from 'lucide-react';
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
    <div className="relative py-20 bg-brand-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Intro Section */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-brand-dark mb-6">
            Choose How You Want Us to Care for Your Dog!
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            At Maria’s Dog Corner, we specialize exclusively in canine care. 
            From energetic walks to cozy overnight stays, book your service directly below.
          </p>
          <div className="mt-6 h-1 w-24 rounded bg-brand-orange mx-auto"></div>
        </div>
        
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* 1. Dog Walking */}
          <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border-2 border-transparent hover:border-brand-teal transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full group">
            {/* Header Image */}
            <div className="h-48 overflow-hidden relative">
              <div className="absolute inset-0 bg-brand-teal/20 group-hover:bg-transparent transition-colors z-10"></div>
              <img src="https://images.unsplash.com/photo-1605639148518-e7d6928d1c33?auto=format&fit=crop&w=800&q=80" alt="Dog Walking" className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-4 z-20 w-12 h-12 rounded-xl bg-brand-orange text-white flex items-center justify-center shadow-md">
                <Dog size={24} />
              </div>
            </div>
            
            <div className="p-8 flex flex-col flex-grow">
              <h3 className="text-2xl font-bold font-display text-gray-900 mb-4">Dog Walking</h3>
              <p className="text-gray-600 mb-6 flex-grow">
                Fun, safe, and energizing walks. From leisurely strolls for seniors to high-energy adventures.
              </p>
              <div className="bg-brand-light/50 rounded-xl p-4 space-y-3 mt-auto">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="font-bold text-gray-700 text-sm">Solo Walk (1hr)</span>
                  <button 
                    onClick={() => handleBookService({
                      id: 'svc-walk-solo', name: 'Solo Dog Walk (1hr)', price: 20, category: 'snack', 
                      image: 'https://images.unsplash.com/photo-1605639148518-e7d6928d1c33?auto=format&fit=crop&w=500&q=80', 
                      description: 'One hour solo walk'
                    })}
                    className="bg-brand-dark text-white text-xs px-3 py-1.5 rounded-full hover:bg-brand-orange transition-colors font-bold"
                  >
                    Book £20
                  </button>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-gray-700 text-sm">Group (Max 3)</span>
                  <button 
                    onClick={() => handleBookService({
                      id: 'svc-walk-group', name: 'Group Dog Walk (Max 3)', price: 50, category: 'snack', 
                      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500&q=80', 
                      description: 'Group adventure walk'
                    })}
                    className="bg-brand-dark text-white text-xs px-3 py-1.5 rounded-full hover:bg-brand-orange transition-colors font-bold"
                  >
                    Book £50
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Pet Sitting */}
          <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border-2 border-transparent hover:border-brand-pink transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full group">
             {/* Header Image */}
             <div className="h-48 overflow-hidden relative">
              <div className="absolute inset-0 bg-brand-pink/20 group-hover:bg-transparent transition-colors z-10"></div>
              <img src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80" alt="Dog Sitting" className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-4 z-20 w-12 h-12 rounded-xl bg-brand-pink text-white flex items-center justify-center shadow-md">
                <Home size={24} />
              </div>
            </div>

            <div className="p-8 flex flex-col flex-grow">
              <h3 className="text-2xl font-bold font-display text-gray-900 mb-4">Dog Sitting</h3>
              <p className="text-gray-600 mb-6 flex-grow">
                Company for your dog in the comfort of their own home. Routine, feeding, and cuddles included.
              </p>
              <div className="bg-brand-light/50 rounded-xl p-4 space-y-3 mt-auto">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="font-bold text-gray-700 text-sm">12 Hours</span>
                  <button 
                     onClick={() => handleBookService({
                      id: 'svc-sit-12', name: 'Dog Sitting (12 Hours)', price: 35, category: 'snack', 
                      image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=500&q=80', 
                      description: '12 Hour in-home sitting'
                    })}
                    className="bg-brand-dark text-white text-xs px-3 py-1.5 rounded-full hover:bg-brand-orange transition-colors font-bold"
                  >
                    Book £35
                  </button>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-gray-700 text-sm">24 Hours</span>
                   <button 
                     onClick={() => handleBookService({
                      id: 'svc-sit-24', name: 'Dog Sitting (24 Hours)', price: 45, category: 'snack', 
                      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80', 
                      description: 'Full day and night care'
                    })}
                    className="bg-brand-dark text-white text-xs px-3 py-1.5 rounded-full hover:bg-brand-orange transition-colors font-bold"
                  >
                    Book £45
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Vacation Care */}
          <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border-2 border-transparent hover:border-brand-yellow transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full group">
             {/* Header Image */}
             <div className="h-48 overflow-hidden relative">
              <div className="absolute inset-0 bg-brand-yellow/20 group-hover:bg-transparent transition-colors z-10"></div>
              <img src="https://images.unsplash.com/photo-1575485670541-82a2b0cb0e25?auto=format&fit=crop&w=800&q=80" alt="Vacation" className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-4 z-20 w-12 h-12 rounded-xl bg-brand-yellow text-white flex items-center justify-center shadow-md">
                <Sun size={24} />
              </div>
            </div>

            <div className="p-8 flex flex-col flex-grow">
              <h3 className="text-2xl font-bold font-display text-gray-900 mb-4">Vacation Care</h3>
              <p className="text-gray-600 mb-6 flex-grow">
                Going on holiday? We provide a home-away-from-home experience. Personalized attention for long stays.
              </p>
              <div className="mt-auto pt-4 border-t border-dashed border-gray-200">
                 <button 
                  onClick={scrollToContact}
                  className="w-full bg-brand-light text-brand-dark font-bold py-3 rounded-xl hover:bg-brand-yellow hover:text-white transition-colors flex items-center justify-center gap-2"
                 >
                   Request Quote
                 </button>
              </div>
            </div>
          </div>

           {/* 4. Pet Minding (Hourly) */}
           <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border-2 border-transparent hover:border-brand-teal transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full group">
             {/* Header Image */}
             <div className="h-48 overflow-hidden relative">
              <div className="absolute inset-0 bg-brand-teal/20 group-hover:bg-transparent transition-colors z-10"></div>
              <img src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80" alt="Pet Minding" className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-4 z-20 w-12 h-12 rounded-xl bg-brand-teal text-white flex items-center justify-center shadow-md">
                <Heart size={24} />
              </div>
            </div>

            <div className="p-8 flex flex-col flex-grow">
              <h3 className="text-2xl font-bold font-display text-gray-900 mb-4">Dog Minding</h3>
              <p className="text-gray-600 mb-6 flex-grow">
                Short-term care for when you're busy. We drop by to feed, play, and check on your furry friend.
              </p>
              <div className="mt-auto pt-4 border-t border-dashed border-gray-200">
                 <button 
                  onClick={scrollToContact}
                  className="w-full bg-brand-light text-brand-dark font-bold py-3 rounded-xl hover:bg-brand-teal hover:text-white transition-colors flex items-center justify-center gap-2"
                 >
                   Request Quote
                 </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};