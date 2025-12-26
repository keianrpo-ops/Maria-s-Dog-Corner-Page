import React, { useState } from 'react';
import { SectionHeading } from './SectionHeading';
import { Star, Quote, ExternalLink, ChevronDown, ChevronUp, ShieldCheck, MessageSquare, Phone, Trophy } from 'lucide-react';
import { Testimonial } from '../types';
import { Button } from './Button';

export const Testimonials: React.FC = () => {
  const [showAll, setShowAll] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // LISTA COMPLETA E ÍNTEGRA DE 50 RESEÑAS (2022 - 2025)
  const allReviews: (Testimonial & { date: string, image: string })[] = [
    // --- 2025 ---
  { id: 1, name: "Emily D.", dogName: "Duggy", date: "Dec 2025", image: "/images/reviews/emily.jpg", text: "Duggy is always safe and well cared for, he loves it 🥰 Amazing care given, as always! Duggy loves Maria and her family, he is so well looked after and they are so kind with us.", rating: 5 },
  { id: 2, name: "Lynne B.", dogName: "Haggis", date: "Nov 2025", image: "/images/reviews/lynne.jpg", text: "Haggis had a lovely stay with Maria, as always. Thank you! ❤️ He has such a fun time and I know he’s happy and safe when he’s there.", rating: 5 },
  { id: 3, name: "Emily D.", dogName: "Duggy", date: "Oct 2025", image: "/images/reviews/emily.jpg", text: "Amazing care given, as always! Duggy loves Maria and her family, he is so well looked after and they are so kind with us.", rating: 5 },
  { id: 4, name: "Luke G.", dogName: "Crumble", date: "Oct 2025", image: "/images/reviews/luke-g.jpg", text: "Crumble was very well looked after at Maria’s. Crumble can be nervous in situations that she’s not used to but Maria and her daughter were very patient with her we can tell she instantly warmed to them and had an amazing time.", rating: 5 },
  { id: 5, name: "Lynne B.", dogName: "Haggis", date: "Sep 2025", image: "/images/reviews/lynne.jpg", text: "Haggis LOVES his trips to Maria’s. He has such a fun time and I know he’s happy and safe when he’s there. Thank you so much ❤️ We’ll be back again soon!", rating: 5 },
  { id: 6, name: "Emily D.", dogName: "Duggy", date: "Sep 2025", image: "/images/reviews/emily.jpg", text: "Thank you again, for taking such wonderful care of our boy, he loves visiting you 🤗🤗🤗", rating: 5 },
  { id: 7, name: "Lynne B.", dogName: "Haggis", date: "Sep 2025", image: "/images/reviews/lynne.jpg", text: "Maria is amazing! As soon as we got to the door, our pup was excited. He had a super day with Maria and family and the regular videos and photos meant we knew he was having a great time.", rating: 5 },
  { id: 8, name: "Luke A.", dogName: "Winston", date: "Sep 2025", image: "/images/reviews/luke-a.jpg", text: "Maria was amazing from start to finish, great updates on what Winston was doing each day. Super happy and great care given along with peace of mind, highly recommend and will be back!!", rating: 5 },
  { id: 9, name: "Emily D.", dogName: "Duggy", date: "Aug 2025", image: "/images/reviews/emily.jpg", text: "Duggy always has such a lovely time with Maria, he is so well looked after xxx", rating: 5 },
  { id: 10, name: "Andy H.", dogName: "Andy's Pup", date: "Aug 2025", image: "/images/reviews/andy.jpg", text: "Absolutely awesome as always! Thanks so much Maria!", rating: 5 },
  { id: 11, name: "Ainsley B.", dogName: "Murphy", date: "Aug 2025", image: "/images/reviews/ainsley.jpg", text: "We love Maria! Always top quality care x", rating: 5 },
  { id: 12, name: "Beth M.", dogName: "Yoyo", date: "Aug 2025", image: "/images/reviews/beth.jpg", text: "Yoyo had a great time with Maria, lots of lovely photos and good communication overall. Will definitely come again next time we're in Bristol 😊", rating: 5 },
  { id: 13, name: "Alex B.", dogName: "Otis & Stanley", date: "Aug 2025", image: "/images/reviews/alex.jpg", text: "Really happy with the care Maria gave Otis and Stanley. It meant we could relax whilst we were away, and regular pictures and videos showed the dogs having a great time.", rating: 5 },
  { id: 14, name: "Emily D.", dogName: "Duggy", date: "Jul 2025", image: "/images/reviews/emily.jpg", text: "He always has such a lovely time. We are so happy to have found such lovely care for our boy ☺️", rating: 5 },
  { id: 15, name: "Angie H.", dogName: "Rosie", date: "Jul 2025", image: "/images/reviews/angie.jpg", text: "Rosie had another lovely holiday with Maria. Always well cared for and we love getting the photos during her stay.", rating: 5 },
  { id: 16, name: "Nick M.", dogName: "Nick's Pups", date: "Jun 2025", image: "/images/reviews/nick.jpg", text: "Maria took really good care of my two. Lots of photos and videos and a safe environment for them to play in, will definitely be using Maria again.", rating: 5 },
  { id: 17, name: "Emily D.", dogName: "Duggy", date: "Jun 2025", image: "/images/reviews/emily.jpg", text: "Thank you for taking such lovely care of our boy xxx", rating: 5 },
  { id: 18, name: "Damaris Y.", dogName: "Damaris' Pup", date: "Jun 2025", image: "/images/reviews/damaris.jpg", text: "Very thankful that Maria could take in my pup for the weekend. We had great photos and updates and we knew he was being cared for. Thank you, Maria and family!", rating: 5 },
  { id: 19, name: "Lilly R.", dogName: "Sweep", date: "Jun 2025", image: "/images/reviews/lilly.jpg", text: "Sweep loved her time with Maria. I got lots of photos and videos everyday which was really helpful as I had never left Sweep with someone before so was very nervous!", rating: 5 },
  { id: 20, name: "Joanne C.", dogName: "Pebbles", date: "Jun 2025", image: "/images/reviews/joanne.jpg", text: "Pebbles had a great day with Maria. She made other doggy friends and I was kept up to date with photos and videos. Thank you so much", rating: 5 },
  { id: 21, name: "Sam T.", dogName: "Sam's Pups", date: "Jun 2025", image: "/images/reviews/sam.jpg", text: "A wonderful first visit for my 2 dogs. I got lots of updates and the dogs came back happy 😊 Maria and her family are very kind.", rating: 5 },
  { id: 22, name: "Emily D.", dogName: "Duggy", date: "Jun 2025", image: "/images/reviews/emily.jpg", text: "We loved the videos and pictures, Duggy has had a lovely day and is now sleeping like a baby! Thank you so much xxx", rating: 5 },
  { id: 23, name: "Nicola W.", dogName: "Misty", date: "Jun 2025", image: "/images/reviews/nicola.jpg", text: "Maria was absolutely brilliant. This is the first time we have used her and we will definitely be using Maria again. Misty had a wonderful time.", rating: 5 },
  { id: 24, name: "Ainsley B.", dogName: "Murphy", date: "May 2025", image: "/images/reviews/ainsley.jpg", text: "As always, Maria has been wonderful. Murphy always comes back from staying with her happy, and well looked after! Always a pleasure with Maria 😊", rating: 5 },
  { id: 25, name: "Sara D.", dogName: "Sara's Lab Brothers", date: "May 2025", image: "/images/reviews/sara-d.jpg", text: "Such lovely people and dog loving home. Looked after our 2 lab brothers brilliantly. Thank you Sara", rating: 5 },

  // --- 2024 ---
  { id: 26, name: "Bobbie H.", dogName: "Joey", date: "May 2024", image: "/images/reviews/bobbie.jpg", text: "Maria & her team are one of the only few places I will send Joey! Her pictures and video updates are amazing & he always loves his time with her.", rating: 5 },
  { id: 27, name: "Angie H.", dogName: "Rosie", date: "May 2024", image: "/images/reviews/angie.jpg", text: "Rosie had another lovely stay with Maria. Shes always well taken care of and I love having the photos sent through during her stay.", rating: 5 },
  { id: 28, name: "Gabriella W.", dogName: "Alba", date: "Apr 2024", image: "/images/reviews/gabriella.jpg", text: "Maria and her son were welcoming and put Alba at ease as soon as she arrived. We even got a bag as a thank you! - her go-to bag for daycare days 😊", rating: 5 },
  { id: 29, name: "Chloe H.", dogName: "Daisy", date: "Mar 2024", image: "/images/reviews/chloe.jpg", text: "Maria and her family are always so amazing with Daisy. She is there at least once a week and has the best time with all of her doggy friends!", rating: 5 },
  { id: 30, name: "Christian W.", dogName: "Hazel", date: "Feb 2024", image: "/images/reviews/christian.jpg", text: "Hazel loves her time at Maria's and gets to hang out and play with other dogs.", rating: 5 },
  { id: 31, name: "Francesca C.", dogName: "Simba", date: "Feb 2024", image: "/images/reviews/francesca.jpg", text: "Simba loves Maria. So grateful for the love and care for my baby 🐶❤️", rating: 5 },
  { id: 32, name: "Jonathan N.", dogName: "Roxy", date: "Jan 2024", image: "/images/reviews/jonathan.jpg", text: "Roxy's needs was met and was well looked after. Be going back as it was obvious she was happy there. Cheers", rating: 5 },
  { id: 33, name: "Ann R.", dogName: "Ann's Pups", date: "Dec 2024", image: "/images/reviews/ann.jpg", text: "Maria was professional and very kind. Both our dogs were nervous but Maria and her family were very welcoming and calm.", rating: 5 },
  { id: 34, name: "Karen M.", dogName: "Karen's Pups", date: "Dec 2024", image: "/images/reviews/karen.jpg", text: "Thank you Maria for looking after the dogs, they came home relaxed and happy.", rating: 5 },
  { id: 35, name: "Rachael M.", dogName: "Rachael's Pup", date: "Dec 2024", image: "/images/reviews/rachael.jpg", text: "Friendly team! Simba was well looked after and I was kept up to date with pics and videos.", rating: 5 },

  // --- 2023 ---
  { id: 36, name: "Jennifer M.", dogName: "Milo", date: "Nov 2023", image: "/images/reviews/jennifer.jpg", text: "Once Milo was with Maria he was right at home. He loves being with her and meeting new doggie friends. I highly recommend her!", rating: 5 },
  { id: 37, name: "Andy O.", dogName: "Andy's Dalmatian", date: "Sep 2023", image: "/images/reviews/andy-o.jpg", text: "Maria was fantastic. They looked after our dalmatian for nearly two weeks and she loved it!", rating: 5 },
  { id: 38, name: "Danielle H.", dogName: "Otis", date: "Sep 2023", image: "/images/reviews/danielle.jpg", text: "Maria was so helpful and Otis seems to have had a lovely time!", rating: 5 },
  { id: 39, name: "Laura W.", dogName: "Shadow", date: "Aug 2023", image: "/images/reviews/laura.jpg", text: "Shadow clearly had a good time and I really liked the way that Maria sent me plenty of photos of him.", rating: 5 },
  { id: 40, name: "Lula L.", dogName: "Lula's Fur Babies", date: "Aug 2023", image: "/images/reviews/lula.jpg", text: "Maria and her Family are lovely people. True dogs lovers who are amazing pet sitters. Highly recommended to everyone. Thank you so much again !!", rating: 5 },
  { id: 41, name: "Harriett W.", dogName: "Hector", date: "Aug 2023", image: "/images/reviews/harriett.jpg", text: "Maria was great, she kept us updated with regular photos which made me feel at ease that Hector was happy and okay.", rating: 5 },
  { id: 42, name: "Laetitia L.", dogName: "Kylo", date: "Jul 2023", image: "/images/reviews/laetitia.jpg", text: "Kylo had a great time at Maria’s. She really knows how to take care of our dog and this is very reassuring. I really recommend her.", rating: 5 },
  { id: 43, name: "Sepand M.", dogName: "Sepand's Boy", date: "Jul 2023", image: "/images/reviews/sepand.jpg", text: "Best sitter I have left my boy with by a long shot, recommend 100%", rating: 5 },
  { id: 44, name: "Gerard K.", dogName: "Rafa", date: "May 2023", image: "/images/reviews/gerard.jpg", text: "Maria and Katerine took such good care of Rafa. The fact that they applied for an animal boarding licence was a big recommendation!", rating: 5 },
  { id: 45, name: "Tracey J.", dogName: "Rocky", date: "May 2023", image: "/images/reviews/tracey.jpg", text: "Thank you for looking after Rocky so well. Not sure he wanted to leave you! Also really appreciate you sending photos and videos.", rating: 5 },

  // --- 2022 ---
  { id: 46, name: "Gillian W.", dogName: "Lara", date: "Apr 2022", image: "/images/reviews/gillian.jpg", text: "Lara was well looked after, had other dogs to play with daily which she loves and we received photos and videos regularly.", rating: 5 },
  { id: 47, name: "James G.", dogName: "Maggie", date: "Dec 2022", image: "/images/reviews/james.jpg", text: "She came back very happy and smelling great! Lots of photos and Maria was very accommodating. Thanks!", rating: 5 },
  { id: 48, name: "A. S.", dogName: "Nephy", date: "Sep 2022", image: "/images/reviews/as.jpg", text: "Maria and her family are very attentive, communicative and caring, giving us peace of mind from day one. Nephy felt as if she was the queen of the house!", rating: 5 },
  { id: 49, name: "Alice B.", dogName: "Alice's Schnoodles", date: "Sep 2022", image: "/images/reviews/alice.jpg", text: "Maria sent lots of photos and videos every day so I was kept up to date and able to relax. My dogs were clearly treated like part of the family.", rating: 5 },
  { id: 50, name: "Lee C.", dogName: "Prince", date: "Aug 2022", image: "/images/reviews/lee.jpg", text: "Prince settled right in with Maria and her family. I got regular pics of Prince while we were on our holiday which put us at ease and let us know he was in safe hands.", rating: 5 }
];

  const displayedReviews = showAll ? allReviews : allReviews.slice(0, 6);

  const handleRoverRedirect = () => {
    window.open('https://www.rover.com/members/maria-g-guaranteed-safety-and-happiness-for-your-pups/', '_blank');
  };

  const handleWhatsAppDirect = () => {
    const phoneNumber = "447594562006"; // Tu número configurado
    const message = encodeURIComponent("Hi Maria! I saw your website and I'd like to book a stay for my dog (Direct Booking - No Fees).");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="relative pt-24 pb-32 bg-brand-dark text-white overflow-hidden">
      
      <div className="absolute inset-0 bg-paw-pattern-dark opacity-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ENCABEZADO IMPACTANTE CON FOTO DE PERRO TRANSPARENTE */}
        <div className="relative flex flex-col lg:flex-row items-center justify-between mb-24 bg-brand-teal/20 p-8 md:p-12 rounded-[3rem] border border-white/10 backdrop-blur-md overflow-hidden">
          
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-brand-yellow/20 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="flex-1 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 bg-brand-yellow text-brand-dark px-4 py-1 rounded-full font-black text-xs uppercase tracking-widest mb-6 animate-bounce">
              <Trophy size={14} />
              Rover Super Star Sitter
            </div>
            
            <h2 className="text-4xl md:text-6xl font-display font-black mb-6 leading-tight">
              Trusted by <span className="text-brand-yellow">150+</span> <br />
              Happy Families
            </h2>
            
            <p className="text-lg md:text-xl text-gray-300 max-w-xl mb-8 font-medium">
              Join the pack of Bristol's highest-rated dog care. 5-star safety, 
              endless love, and daily updates for every pup.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
               <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                  <Star className="text-brand-yellow" size={18} fill="currentColor" />
                  <span className="font-bold">5.0 Rating</span>
               </div>
               <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                  <ShieldCheck className="text-brand-teal" size={18} />
                  <span className="font-bold">Licensed & Insured</span>
               </div>
            </div>
          </div>

          {/* ESPACIO PARA FOTO TRANSPARENTE DE TU PERRO */}
          <div className="relative mt-12 lg:mt-0 flex-shrink-0 lg:w-[400px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-teal to-brand-yellow opacity-10 rounded-full scale-110"></div>
            <div className="relative z-10 w-64 h-64 md:w-80 md:h-80 mx-auto">
                <img 
                  src="/images/your-dog-transparent.png" 
                  alt="Super Star Dog" 
                  className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(255,183,0,0.3)] transform hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.classList.add('flex', 'items-center', 'justify-center', 'bg-white/5', 'rounded-full', 'border-2', 'border-dashed', 'border-white/20');
                    e.currentTarget.parentElement!.innerHTML = '<span class="text-white/20 font-bold text-center p-4 text-xs">Add your transparent dog image here</span>';
                  }}
                />
            </div>
          </div>
        </div>
        
        {/* GRID DE RESEÑAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedReviews.map((review) => (
            <div key={review.id} className="bg-white text-gray-800 rounded-3xl p-8 shadow-xl border-b-8 border-brand-teal animate-fade-in flex flex-col h-full hover:shadow-brand-teal/20 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-1 text-brand-orange">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <div className="bg-brand-yellow/10 text-brand-yellow p-2 rounded-xl">
                  <Quote size={20} fill="currentColor" />
                </div>
              </div>
              
              <p className="text-gray-600 italic mb-8 leading-relaxed flex-grow text-sm">"{review.text}"</p>
              
              <div className="flex items-center gap-4 border-t border-gray-100 pt-6 mt-auto">
                <div className="w-14 h-14 rounded-full bg-brand-teal/10 flex items-center justify-center font-bold text-brand-teal border-2 border-brand-teal/20 overflow-hidden relative group-hover:border-brand-teal transition-colors">
                  {review.image ? (
                    <img src={review.image} className="w-full h-full object-cover" alt={review.dogName} />
                  ) : (
                    <span className="text-lg">{review.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-brand-dark leading-none mb-1 text-sm">{review.name}</h4>
                  <p className="text-brand-teal text-[10px] font-bold uppercase tracking-widest">Owner of {review.dogName}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BOTÓN VER MÁS (CARGA LAS 50) */}
        <div className="mt-16 text-center">
          <button 
            onClick={() => setShowAll(!showAll)}
            className="group inline-flex items-center gap-2 text-brand-yellow font-black hover:text-white transition-all text-xl uppercase tracking-tighter"
          >
            {showAll ? <><ChevronUp /> Show Fewer</> : <><ChevronDown className="animate-bounce" /> Explore 50+ More Success Stories</>}
          </button>
        </div>

        {/* TRIPLE BOTONERA DE ACCIÓN */}
        <div className="mt-24 bg-white/5 p-12 rounded-[4rem] border border-white/10 text-center">
          <h3 className="text-3xl font-display font-black mb-10 text-white">Ready for a stress-free holiday?</h3>
          
          <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl mx-auto justify-center">
            
            <Button 
              onClick={handleRoverRedirect}
              className="flex-1 bg-white text-brand-dark hover:bg-gray-100 border-b-8 border-gray-200 py-8 text-lg font-black"
            >
              <ExternalLink className="mr-2" />
              Rover Profile
            </Button>

            {/* BOTÓN WHATSAPP DIRECTO CON TEXTO "NO FEES" */}
            <Button 
              onClick={handleWhatsAppDirect}
              className="flex-1 bg-brand-orange text-white hover:bg-brand-orange/90 border-b-8 border-brand-orange-dark py-6 text-lg font-black shadow-[0_20px_40px_rgba(255,107,0,0.3)] transform scale-110 z-20 flex flex-col items-center justify-center gap-0"
            >
              <div className="flex items-center gap-2">
                <Phone size={20} />
                <span>Book Direct</span>
              </div>
              <span className="text-[10px] uppercase tracking-widest opacity-90 mt-[-2px]">(No Fees)</span>
            </Button>

            <Button 
              onClick={() => setIsReviewModalOpen(true)}
              className="flex-1 bg-brand-teal text-white hover:bg-brand-teal/90 border-b-8 border-brand-teal-dark py-8 text-lg font-black"
            >
              <MessageSquare className="mr-2" />
              Leave Review
            </Button>

          </div>
        </div>
      </div>

      {/* MODAL DE RESEÑA */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-lg text-gray-800 shadow-2xl relative">
            <button onClick={() => setIsReviewModalOpen(false)} className="absolute top-6 right-8 text-gray-300 hover:text-brand-orange text-3xl">×</button>
            <h3 className="text-3xl font-black mb-6 text-brand-dark tracking-tighter">New Review</h3>
            <div className="space-y-5">
              <input type="text" placeholder="Your Name" className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-teal" />
              <input type="text" placeholder="Pup's Name" className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-teal" />
              <div className="flex gap-2 text-brand-yellow">
                {[...Array(5)].map((_, i) => <Star key={i} size={24} fill="currentColor" />)}
              </div>
              <textarea placeholder="How was the stay?" rows={4} className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-brand-teal"></textarea>
              <Button onClick={() => setIsReviewModalOpen(false)} className="w-full bg-brand-dark text-white py-5 rounded-2xl font-black text-xl">Post Review</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};