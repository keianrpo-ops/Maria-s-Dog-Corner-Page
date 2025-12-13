import React from 'react';

export const FloatingSeal: React.FC = () => {
  return (
    <div className="fixed bottom-6 left-6 z-40 hidden md:flex items-center gap-3 animate-fade-in-up">
      {/* The Seal Container */}
      <div className="relative group cursor-help">
        
        {/* White circle background to make the black stamp pop */}
        <div className="w-20 h-20 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
           <img 
             src="/images/seal.png" 
             alt="UK Animal & Plant Health Agency Approved" 
             className="w-full h-full object-contain p-1 opacity-90"
             onError={(e) => e.currentTarget.style.display = 'none'} 
           />
        </div>

        {/* Tooltip that appears on hover */}
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 w-48 bg-white text-brand-dark text-xs p-3 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border border-gray-100">
           <p className="font-bold uppercase mb-1">Officially Approved</p>
           <p className="text-gray-500 leading-tight">By the UK Animal & Plant Health Agency.</p>
           <p className="font-mono font-bold mt-1 text-brand-teal">Lic: U1596090</p>
        </div>
      </div>
    </div>
  );
};