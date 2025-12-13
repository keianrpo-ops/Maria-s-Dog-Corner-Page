import React, { useState } from 'react';
import { ShoppingCart, Heart, Dog, Tag } from 'lucide-react';
import { Product } from '../types';

interface ShopProps {
  addToCart: (product: Product) => void;
}

// Sub-component to handle individual product logic and image errors cleanly
const ProductCard: React.FC<{ product: Product; addToCart: (p: Product) => void }> = ({ product, addToCart }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group flex flex-col h-full">
      {/* CARD CONTAINER with Soft Shadow */}
      <div className="relative flex flex-col bg-white rounded-[2rem] overflow-hidden transition-all duration-500 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_50px_-12px_rgba(0,194,203,0.25)] hover:-translate-y-2 border border-gray-100 h-full">
        
        {/* IMAGE AREA - NOW FRAMED (Padded) - p-5 */}
        <div className="p-5 bg-gray-50/50">
            {/* CHANGED TO ASPECT-SQUARE for better fit of mixed orientation images */}
            <div className="relative aspect-square overflow-hidden rounded-2xl shadow-sm group-hover:shadow-md transition-all duration-500 bg-white border border-black/5 flex items-center justify-center">
                
                {/* Optional: Add slight background blur if product image isn't transparent (uncomment if needed) */}
                {/* <div className="absolute inset-0 z-0">
                     <img src={product.image} className="w-full h-full object-cover blur-xl opacity-20 scale-125" alt="" />
                </div> */}

                {/* Top Tags */}
                <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 items-start">
                    {product.tag && (
                    <span className={`text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-lg backdrop-blur-md ${
                        product.tag === 'Best Seller' ? 'bg-brand-orange/90' : product.tag === 'Tech' ? 'bg-purple-500/90' : 'bg-brand-dark/90'
                    }`}>
                        {product.tag}
                    </span>
                    )}
                </div>
                
                {/* Wishlist Button */}
                <button className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/60 hover:bg-white backdrop-blur-md flex items-center justify-center text-gray-500 hover:text-brand-pink transition-all shadow-sm">
                    <Heart size={16} />
                </button>

                {/* Image - object-contain ensures full product visibility */}
                {!imgError ? (
                <img 
                    src={product.image} 
                    alt={product.name} 
                    onError={() => setImgError(true)}
                    className="relative z-10 w-full h-full object-contain transform transition-transform duration-700 hover:scale-105 p-2"
                />
                ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                    <Dog size={32} className="mb-2 opacity-20" />
                    <span className="font-bold text-[10px] uppercase tracking-widest opacity-60">Image Coming Soon</span>
                </div>
                )}
                
                {/* INTEGRATED PRICE BADGE (Bottom Right of Image) */}
                <div className="absolute bottom-3 right-3 z-20">
                    <div className="bg-white/95 backdrop-blur-xl px-3 py-1.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] flex items-center gap-1 border border-white/50 transform group-hover:scale-105 transition-transform">
                        <span className="text-xs font-bold text-gray-400 mr-1">£</span>
                        <span className="text-lg font-display font-extrabold text-brand-dark">{product.price.toFixed(2)}</span>
                    </div>
                </div>

                {/* Add to Cart Overlay (Desktop Slide-up) */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent translate-y-full md:group-hover:translate-y-0 transition-transform duration-300 flex justify-center pb-20 pointer-events-none">
                    {/* Decorative gradient for text readability if needed */}
                </div>
            </div>
        </div>

        {/* CONTENT AREA */}
        <div className="px-6 pb-6 pt-2 flex flex-col flex-grow relative bg-white">
             {/* Title & Cat */}
             <div className="mb-4">
                 <p className="text-xs font-bold text-brand-teal uppercase tracking-wider mb-1 flex items-center gap-1">
                    {product.category === 'snack' ? 'Natural Treat' : 'Durability Toy'}
                 </p>
                 <h3 className="text-lg md:text-xl font-bold text-gray-800 leading-tight group-hover:text-brand-orange transition-colors font-display">
                    {product.name}
                 </h3>
                 <p className="text-gray-500 text-xs md:text-sm mt-2 line-clamp-2 leading-relaxed">
                    {product.description}
                 </p>
             </div>

             {/* Action Button */}
             <div className="mt-auto pt-2">
                <button 
                    onClick={() => addToCart(product)} 
                    className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-brand-orange transition-colors flex items-center justify-center gap-2 group/btn active:scale-95"
                >
                    <ShoppingCart size={18} className="text-brand-yellow group-hover/btn:text-white transition-colors" />
                    <span>Add to Cart</span>
                </button>
             </div>
        </div>
      </div>
    </div>
  );
};

export const Shop: React.FC<ShopProps> = ({ addToCart }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'snack' | 'toy'>('all');

  const bannerImages = {
    all: "/images/banners/shop-header.jpg", 
    snack: "/images/banners/snack-header.jpg", 
    toy: "/images/banners/toy-header.jpg" 
  };

  const products: Product[] = [
    // --- SNACKS ---
    {
      id: 's1', name: 'Salmon Delight', category: 'snack', price: 6.50,
      image: '/images/shop/s1-salmon.jpg',
      description: '100% Natural Salmon (70%) with veggies.', tag: 'Best Seller'
    },
    {
      id: 's2', name: 'Liver Luxury', category: 'snack', price: 5.99,
      image: '/images/shop/s2-liver.jpg',
      description: 'Rich Beef Liver (70%) combined with wholesome vegetables.',
    },
    {
      id: 's3', name: 'Beef Bonanza', category: 'snack', price: 6.20,
      image: '/images/shop/s3-beef.jpg',
      description: 'Human-grade Beef (70%) and veggies.',
    },
    {
      id: 's4', name: 'Chicken & Veggie', category: 'snack', price: 5.99,
      image: '/images/shop/s4-chicken.jpg',
      description: 'Lean Chicken Breast (70%) with nutrient-rich broccoli.',
    },
    {
      id: 's5', name: 'Lamb Love', category: 'snack', price: 6.50,
      image: '/images/shop/s5-lamb.jpg',
      description: 'Hypoallergenic Lamb (70%). Gentle on sensitive stomachs.', tag: 'Sensitive'
    },
    {
      id: 's6', name: 'Garden Veggies', category: 'snack', price: 5.50,
      image: '/images/shop/s6-veggie.jpg',
      description: '100% Plant-based goodness.', tag: 'Vegan'
    },
    
    // --- TOYS ---
    {
      id: 't1', name: 'Tire Chew', category: 'toy', price: 12.99,
      image: '/images/shop/t1-tire.jpg', 
      description: 'Heavy duty rubber tire.', tag: 'Tough'
    },
    {
      id: 't2', name: 'Plush Fox', category: 'toy', price: 8.50,
      image: '/images/shop/t2-fox.jpg',
      description: 'No-stuffing plush toy with 2 squeakers.',
    },
    {
      id: 't3', name: 'Dental Rope', category: 'toy', price: 7.99,
      image: '/images/shop/t3-rope.jpg',
      description: 'Cleans teeth while playing! Mint-scented.',
    },
    {
      id: 't4', name: 'Puzzle Feeder', category: 'toy', price: 15.99,
      image: '/images/shop/t4-puzzle.jpg',
      description: 'Mental stimulation game.', tag: 'Smart'
    },
    {
      id: 't5', name: 'Rubber Ball', category: 'toy', price: 5.99,
      image: '/images/shop/t5-ball.jpg',
      description: 'High-bounce ball that floats!',
    },
    {
      id: 't6', name: 'Frisbee Flyer', category: 'toy', price: 8.99,
      image: '/images/shop/t6-frisbee.jpg',
      description: 'Aerodynamic and soft on teeth.',
    },
    {
      id: 't7', name: 'Tug-o-War Rope', category: 'toy', price: 10.50,
      image: '/images/shop/t7-tug.jpg',
      description: 'Extra long 3-knot rope.', tag: 'Interactive'
    },
    {
      id: 't8', name: 'Squeaky Hedgehog', category: 'toy', price: 9.99,
      image: '/images/shop/t8-hedgehog.jpg',
      description: 'Soft plush with a durable internal squeaker.',
    },
    {
      id: 't9', name: 'Indestructible Bone', category: 'toy', price: 14.50,
      image: '/images/shop/t9-bone.jpg',
      description: 'Nylon infused with bacon flavor.', tag: 'Tough'
    },
    {
      id: 't10', name: 'Agility Tunnel', category: 'toy', price: 35.00,
      image: '/images/shop/t10-tunnel.jpg',
      description: 'Foldable tunnel for backyard training.',
    },
    {
      id: 't11', name: 'Snuffle Mat XL', category: 'toy', price: 22.00,
      image: '/images/shop/t11-mat.jpg',
      description: 'Hide kibble in the fabric strips.', tag: 'Brain Game'
    },
    {
      id: 't12', name: 'Rubber Chicken', category: 'toy', price: 4.99,
      image: '/images/shop/t12-chicken.jpg',
      description: 'The classic hilarious squeaking toy.',
    },
    {
      id: 't13', name: 'Water Floater', category: 'toy', price: 11.50,
      image: '/images/shop/t13-floater.jpg',
      description: 'Bright orange ring that never sinks.',
    },
    {
      id: 't14', name: 'Plush Donut', category: 'toy', price: 7.50,
      image: '/images/shop/t14-donut.jpg',
      description: 'Cute, soft, and perfect for cuddling.',
    },
    {
      id: 't15', name: 'Spiky Ball', category: 'toy', price: 6.00,
      image: '/images/shop/t15-spiky.jpg',
      description: 'Massages gums while they chew.',
    },
    {
      id: 't16', name: 'Automatic Launcher', category: 'toy', price: 45.00,
      image: '/images/shop/t16-launcher.jpg',
      description: 'Launches tennis balls automatically.', tag: 'Tech'
    }
  ];

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="bg-gray-50 min-h-screen">
      
      {/* DYNAMIC SHOP HEADER */}
      <div className="relative h-[35vh] md:h-[50vh] bg-brand-teal flex items-center justify-center overflow-hidden transition-all duration-700">
         <div className="absolute inset-0 mix-blend-multiply opacity-40 transition-opacity duration-500">
            <img 
              key={activeCategory} 
              src={bannerImages[activeCategory]} 
              onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?ixlib=rb-1.2.1&auto=format&fit=crop&w=2100&q=80";
              }}
              alt="Category Banner" 
              className="w-full h-full object-cover object-center animate-fade-in" 
            />
         </div>
         
         <div className="absolute inset-0 bg-gradient-to-t from-brand-teal via-transparent to-brand-teal/20"></div>
         
         <div className="relative z-10 text-center max-w-4xl px-4">
            <p className="text-white font-bold tracking-[0.2em] uppercase mb-2 md:mb-4 text-xs md:text-base drop-shadow-md">The Collection</p>
            <h2 className="text-4xl md:text-8xl font-display font-extrabold text-white drop-shadow-lg mb-2 capitalize leading-tight">
               {activeCategory === 'all' ? (
                 <>Maria's <span className="text-brand-yellow">Favorites</span></>
               ) : activeCategory === 'snack' ? (
                 <>Premium <span className="text-brand-yellow">Rewards</span></>
               ) : (
                 <>Active <span className="text-brand-yellow">Play</span></>
               )}
            </h2>
            <p className="text-teal-50 text-sm md:text-xl font-medium max-w-2xl mx-auto mt-2 md:mt-4 drop-shadow-sm px-4">
              {activeCategory === 'all' 
                ? "Browse our curated selection of veterinary-approved snacks and indestructible toys."
                : activeCategory === 'snack'
                ? "100% natural, air-dried ingredients."
                : "Engineered for durability."}
            </p>

            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 hidden lg:block">
               <img 
                 src="/images/seal.png" 
                 alt="Approved Seal" 
                 className="w-32 h-32 object-contain bg-white rounded-full p-2 shadow-2xl rotate-12"
                 onError={(e) => e.currentTarget.style.display = 'none'}
               />
            </div>
         </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-12 md:py-20">
        
        {/* Filter Tabs */}
        <div className="flex justify-center mb-12 md:mb-20">
          <div className="inline-flex bg-white p-1.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.05)] scale-90 md:scale-100 origin-center border border-gray-100">
            {[
              { id: 'all', label: 'All' },
              { id: 'snack', label: 'Snacks' },
              { id: 'toy', label: 'Toys' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-6 py-2 md:px-8 md:py-3 rounded-full text-xs md:text-base font-bold transition-all duration-300 ${
                  activeCategory === cat.id 
                    ? 'bg-brand-dark text-white shadow-md transform scale-105' 
                    : 'text-gray-500 hover:text-brand-dark hover:bg-gray-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 gap-y-8 md:gap-x-8 md:gap-y-12">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} addToCart={addToCart} />
          ))}
        </div>

      </div>
    </div>
  );
};