import React from 'react';
import { PageView } from '../types';
import { Instagram, Facebook, Twitter, Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  setView: (view: PageView) => void;
}

export const Footer: React.FC<FooterProps> = ({ setView }) => {
  return (
    <footer className="bg-brand-dark text-white py-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-display text-white">Maria's<span className="text-brand-teal">Dog Corner</span></h2>
            <p className="text-gray-300 leading-relaxed text-sm">
              Professional, reliable, and loving pet care services. We treat every dog as part of our own family.
            </p>
            
            {/* Approval Badge - Official Image - Large in Footer */}
            <div className="flex flex-col gap-2 p-4 bg-white/5 rounded-2xl border border-white/10">
               <span className="text-xs font-bold text-brand-pink uppercase tracking-widest">Certified & Approved</span>
               <div className="flex items-center gap-3">
                 {/* Updated Circle Container: Removed padding, added overflow-hidden */}
                 <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center shrink-0 overflow-hidden border-2 border-white/20">
                   {/* Updated Image: Added scale-[1.35] to zoom in */}
                   <img 
                     src="/images/seal.png" 
                     alt="Official Approval Seal" 
                     className="w-full h-full object-cover scale-[1.35]"
                     onError={(e) => {
                       e.currentTarget.style.display = 'none';
                     }}
                   />
                 </div>
                 <div className="text-xs text-gray-400">
                    <p className="text-white font-bold">Animal & Plant Health Agency</p>
                    <p>UK Govt Approved</p>
                    <p className="font-mono mt-1 text-brand-teal">U1596090</p>
                 </div>
               </div>
            </div>

            <div className="flex gap-4 pt-2">
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-brand-pink transition-colors" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-brand-pink transition-colors" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-brand-pink transition-colors" aria-label="Twitter">
                <Twitter size={18} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold mb-6 text-brand-pink uppercase tracking-widest">Explore</h3>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => setView(PageView.HOME)} className="text-gray-300 hover:text-white hover:translate-x-1 transition-all flex items-center gap-2">Home</button></li>
              <li><button onClick={() => setView(PageView.SHOP)} className="text-gray-300 hover:text-white hover:translate-x-1 transition-all flex items-center gap-2">Shop Snacks & Toys</button></li>
              <li><button onClick={() => setView(PageView.SERVICES)} className="text-gray-300 hover:text-white hover:translate-x-1 transition-all flex items-center gap-2">Services</button></li>
              <li><button onClick={() => setView(PageView.ABOUT)} className="text-gray-300 hover:text-white hover:translate-x-1 transition-all flex items-center gap-2">About Us</button></li>
              <li><button onClick={() => setView(PageView.CONTACT)} className="text-gray-300 hover:text-white hover:translate-x-1 transition-all flex items-center gap-2">Contact</button></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-bold mb-6 text-brand-pink uppercase tracking-widest">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-gray-300">
                <Phone size={18} className="shrink-0 text-brand-teal" />
                <span>07594 562 006</span>
              </li>
              <li className="flex items-start gap-3 text-gray-300">
                <Mail size={18} className="shrink-0 text-brand-teal" />
                <span>info@mariasdogcorner.co.uk</span>
              </li>
              <li className="flex items-start gap-3 text-gray-300">
                <MapPin size={18} className="shrink-0 text-brand-teal" />
                <span>87 Portview, Avonmouth<br/>Bristol, BS11 9JE, UK</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-bold mb-6 text-brand-pink uppercase tracking-widest">Newsletter</h3>
            <p className="text-gray-300 mb-4 text-xs">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
            <form className="flex flex-col gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-teal focus:bg-white/10"
              />
              <button className="bg-brand-teal text-white font-bold py-2 rounded-lg hover:bg-teal-400 transition-colors text-sm shadow-lg">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-gray-800 text-center text-gray-500 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Maria's Dog Corner. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};