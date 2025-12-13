import React, { useState } from 'react';
import { SectionHeading } from './SectionHeading';
import { Mail, Phone, MapPin, Send, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { Button } from './Button';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '', petDetails: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submission
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '', petDetails: '' });
    }, 1000);
  };

  return (
    <div className="py-16 bg-white" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading 
          title="Get in Touch" 
          subtitle="Ready to book a walk or have a question? We'd love to hear from you."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info Side */}
          <div className="bg-brand-light rounded-2xl p-8 lg:p-12">
            <h3 className="text-2xl font-bold text-brand-dark mb-6">Contact Information</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-full shadow-sm text-brand-teal">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Phone</p>
                  <p className="text-gray-600">07594 562 006</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-full shadow-sm text-brand-teal">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Email</p>
                  <p className="text-gray-600">info@mariasdogcorner.co.uk</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-full shadow-sm text-brand-teal">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Address / Service Area</p>
                  <p className="text-gray-600">87 Portview, Avonmouth<br/>Bristol, BS11 9JE, UK</p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <h4 className="font-bold text-gray-900 mb-4">Follow our adventures</h4>
              <div className="flex gap-4">
                <a href="#" className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-dark hover:bg-brand-orange hover:text-white transition-all shadow-sm">
                  <Instagram size={24} />
                </a>
                <a href="#" className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-dark hover:bg-brand-orange hover:text-white transition-all shadow-sm">
                  <Facebook size={24} />
                </a>
                <a href="#" className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-dark hover:bg-brand-orange hover:text-white transition-all shadow-sm">
                  <MessageCircle size={24} />
                </a>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-white">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-brand-teal rounded-2xl bg-brand-light/30">
                <div className="bg-green-100 p-4 rounded-full text-green-600 mb-4">
                  <Send size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-600">Thanks for reaching out. Maria will get back to you shortly.</p>
                <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-6">Send another</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input 
                    required 
                    type="text" 
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none transition"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    required 
                    type="email" 
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none transition"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="pet" className="block text-sm font-medium text-gray-700 mb-1">Pet Details (Name, Breed, Age)</label>
                  <input 
                    type="text" 
                    id="pet"
                    value={formData.petDetails}
                    onChange={(e) => setFormData({...formData, petDetails: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none transition"
                    placeholder="Rex, Labrador, 3 years old"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">How can we help?</label>
                  <textarea 
                    required 
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-teal focus:border-transparent outline-none transition"
                    placeholder="I'm looking for dog walking 3 times a week..."
                  ></textarea>
                </div>
                <Button type="submit" className="w-full">Send Message</Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};