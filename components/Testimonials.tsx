import React from 'react';
import { SectionHeading } from './SectionHeading';
import { Star, Quote, MessageCircle } from 'lucide-react';
import { Testimonial } from '../types';
import { Button } from './Button';

export const Testimonials: React.FC = () => {
  const reviews: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Jenkins",
      dogName: "Barney",
      text: "Maria is absolutely wonderful with Barney! He gets so excited when he sees her car pull up. I love the daily photo updates.",
      rating: 5
    },
    {
      id: 2,
      name: "Mike & Tom",
      dogName: "Luna",
      text: "We were nervous about leaving Luna for our holiday, but Maria's home boarding service was perfect. Luna came home happy and tired.",
      rating: 5
    },
    {
      id: 3,
      name: "Emily R.",
      dogName: "Cooper",
      text: "Reliable, trustworthy, and genuinely cares about the dogs. Cooper has improved so much on his lead walking since joining the group walks.",
      rating: 5
    }
  ];

  const handleWriteReview = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative pt-24 pb-32 bg-brand-dark text-white overflow-hidden">
      
      {/* Top Wave */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[60px] text-brand-light fill-current">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>

      {/* Pattern Overlay */}
      <div className="absolute inset-0 bg-paw-pattern-dark opacity-30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center mb-16">
          <SectionHeading 
            title="What Our Clients Say" 
            subtitle="Real reviews from happy pups and their humans."
            light={true}
          />
          <div className="bg-brand-orange/20 px-6 py-2 rounded-full border border-brand-orange/50 backdrop-blur-sm">
             <div className="flex gap-2 items-center">
                <span className="font-bold text-brand-yellow text-xl">5.0</span>
                <div className="flex text-brand-yellow">
                  <Star size={20} fill="currentColor" />
                  <Star size={20} fill="currentColor" />
                  <Star size={20} fill="currentColor" />
                  <Star size={20} fill="currentColor" />
                  <Star size={20} fill="currentColor" />
                </div>
                <span className="text-sm text-gray-300 ml-2">Based on 150+ Reviews</span>
             </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <div key={review.id} className={`bg-white text-gray-800 rounded-3xl p-8 shadow-2xl relative transform transition hover:-translate-y-2 duration-300 border-b-8 ${idx % 2 === 0 ? 'border-brand-teal' : 'border-brand-orange'}`}>
              <div className="absolute -top-6 left-8 bg-brand-yellow p-3 rounded-full shadow-lg">
                <Quote className="text-white" size={24} />
              </div>
              
              <div className="mt-4 mb-4 flex gap-1 text-brand-orange">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>
              
              <p className="text-gray-600 italic mb-6 leading-relaxed text-lg">"{review.text}"</p>
              
              <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-brand-dark">{review.name}</h4>
                  <p className="text-brand-teal text-sm font-bold uppercase tracking-wide">Owner of {review.dogName}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-display font-bold mb-6 text-white">Have you used our services?</h3>
          <Button 
            onClick={handleWriteReview}
            variant="primary" 
            size="lg" 
            className="bg-white text-brand-dark hover:bg-gray-100 hover:text-brand-orange shadow-xl border-4 border-transparent hover:border-brand-orange transition-all"
          >
            <MessageCircle className="mr-2" size={20} />
            Write a Review
          </Button>
        </div>
      </div>

       {/* Bottom Wave */}
       <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[60px] text-white fill-current">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"></path>
        </svg>
      </div>
    </div>
  );
};