import React from 'react';
import { SectionHeading } from './SectionHeading';
import { Check } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="relative py-24 bg-brand-light overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
          
          {/* Left Column: Image with Offset Background */}
          <div className="lg:col-span-5 relative mb-12 lg:mb-0">
            {/* The offset background card (Cream/Beige tone from reference) */}
            <div className="absolute top-4 -left-4 w-full h-full bg-[#F5E6CA] rounded-[2.5rem] transform -rotate-2"></div>
            
            {/* The Image */}
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl transform rotate-0 hover:rotate-1 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1517423568366-eb980dd2d41c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Maria with a pug" 
                className="w-full h-full object-cover aspect-[4/5]"
              />
            </div>
          </div>
          
          {/* Right Column: Content */}
          <div className="lg:col-span-7 pl-0 lg:pl-8">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-dark mb-2">
              Meet Maria
            </h2>
            <div className="h-1.5 w-24 bg-brand-orange rounded-full mb-6"></div>
            
            <h3 className="text-xl font-medium text-gray-500 mb-8 italic">
              Passionate about paws since 2018.
            </h3>
            
            <div className="space-y-6 text-gray-700 leading-relaxed text-lg mb-10">
              <p>
                Hello! I'm Maria, the founder of Maria's Dog Corner. My journey began with volunteering at local shelters, where I discovered a deep connection with dogs of all temperaments and backgrounds.
              </p>
              <p>
                I believe that every dog deserves individual understanding. Whether you have a high-energy spaniel or a shy rescue, I adapt my approach to ensure they feel safe, loved, and engaged.
              </p>
            </div>
            
            {/* Feature Grid - Matching the reference style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              {[
                "Canine First Aid Certified",
                "DBS Checked & Insured",
                "Positive Reinforcement Only",
                "Flexible Scheduling",
                "Photo Updates Every Walk",
                "Local to Your Area"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 group">
                  <div className="w-6 h-6 rounded-full border-2 border-brand-teal flex items-center justify-center shrink-0 group-hover:bg-brand-teal transition-colors">
                    <Check className="text-brand-teal group-hover:text-white w-3.5 h-3.5 stroke-[4]" />
                  </div>
                  <span className="font-medium text-brand-dark">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave SVG */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[80px] text-white fill-current">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0A1000,1000,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>
    </div>
  );
};