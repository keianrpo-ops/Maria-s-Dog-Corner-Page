import React, { useState } from 'react';
import { Award, Shield, Heart, Clock, Camera, Scissors } from 'lucide-react';

export const About: React.FC = () => {
  // Estado para controlar qué imagen está al frente (0, 1 o 2)
  const [activeIndex, setActiveIndex] = useState(0);

  const features = [
    { title: "20 Years Experience", icon: <Award className="text-brand-orange" /> },
    { title: "Licensed & Insured", icon: <Shield className="text-brand-teal" /> },
    { title: "Expert Dog Groomer", icon: <Scissors className="text-brand-orange" /> },
    { title: "Canine First Aid", icon: <Heart className="text-brand-teal" /> },
    { title: "Daily Photo Updates", icon: <Camera className="text-brand-orange" /> },
    { title: "Flexible Scheduling", icon: <Clock className="text-brand-teal" /> },
  ];

  const images = [
    { src: "/images/about-1.jpg", alt: "Maria working", fallback: "https://images.unsplash.com/photo-1581888227599-779811939961?q=80&w=800", label: "Expert Care" },
    { src: "/images/about-2.jpg", alt: "Dog Grooming", fallback: "https://images.unsplash.com/photo-1541599540903-216a46ca1ad0?q=80&w=800", label: "Professional" },
    { src: "/images/about-3.jpg", alt: "Happy Client", fallback: "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=800", label: "Certified" },
  ];

  return (
    <div className="relative py-24 bg-brand-light overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
          
          {/* COLUMNA IZQUIERDA: ABANICO INTERACTIVO */}
          <div className="lg:col-span-5 relative mb-20 lg:mb-0 h-[550px] flex items-center justify-center">
            
            {images.map((img, index) => {
              // Lógica de posicionamiento dinámico
              const isActive = activeIndex === index;
              const offset = index - activeIndex;
              
              return (
                <div
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`absolute w-72 h-96 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white transition-all duration-500 cursor-pointer
                    ${isActive ? 'z-40 scale-105 rotate-0 translate-x-0' : 
                      offset === -1 || offset === 2 ? 'z-20 -rotate-12 -translate-x-24 opacity-80 scale-90 hover:opacity-100' : 
                      'z-20 rotate-12 translate-x-24 opacity-80 scale-90 hover:opacity-100'}
                  `}
                  style={{
                    boxShadow: isActive ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 10px 20px -5px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <img 
                    src={img.src} 
                    alt={img.alt} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = img.fallback; }}
                  />
                  
                  {/* Overlay gradiente solo en la activa o al hacer hover */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-brand-dark/60 via-transparent to-transparent transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 hover:opacity-40'}`}>
                    <div className="absolute bottom-6 left-6 text-white font-display font-bold text-xl">
                      {img.label}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Badge flotante animado */}
            <div className="absolute -bottom-6 -right-6 bg-brand-yellow p-4 rounded-2xl shadow-lg z-50 rotate-12 animate-bounce pointer-events-none">
                <span className="font-black text-brand-dark uppercase text-xs tracking-tighter">Star Sitter ⭐</span>
            </div>
          </div>
          
          {/* COLUMNA DERECHA: TEXTO */}
          <div className="lg:col-span-7 pl-0 lg:pl-8">
            <div className="inline-block bg-brand-orange/10 text-brand-orange px-4 py-1 rounded-full text-sm font-bold mb-4 uppercase tracking-widest">
                Our Founder
            </div>
            <h2 className="text-5xl md:text-6xl font-display font-black text-brand-dark mb-4 leading-tight">
              Meet <span className="text-brand-teal">Maria</span>
            </h2>
            <div className="h-2 w-32 bg-brand-yellow rounded-full mb-8"></div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
              <Scissors className="text-brand-orange" />
              20 years of professional grooming & care
            </h3>
            
            <div className="space-y-6 text-gray-700 leading-relaxed text-lg mb-12">
              <p>
                Hello! I'm Maria, the founder of Maria's Dog Corner. My journey began over two decades ago, combining my passion for animals with professional training in <strong>canine grooming and welfare</strong>.
              </p>
              <p>
                As a <strong>Certified Star Sitter</strong>, I believe every dog is unique. From high-energy puppies to nervous rescues, I use my 20 years of experience to ensure your pup feels safe, loved, and pampered while you are away.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-teal/30 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <span className="font-bold text-brand-dark text-base">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[60px] text-white fill-current">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0A1000,1000,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>
    </div>
  );
};