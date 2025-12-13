import React, { useState } from 'react';
import { ShoppingCart, Heart, Dog } from 'lucide-react';
import { Product } from '../types';

interface ShopProps {
  addToCart: (product: Product) => void;
}

// Sub-component to handle individual product logic and image errors cleanly
const ProductCard: React.FC<{ product: Product; addToCart: (p: Product) => void }> = ({ product, addToCart }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group flex flex-col">
      {/* CARD IMAGE CONTAINER */}
      <div className="relative aspect-[4/5] bg-gray-50 rounded-[2rem] overflow-hidden mb-6 group-hover:shadow-2xl transition-all duration-500 border border-gray-100 group-hover:border-brand-teal/30">
        
        {/* Tags */}
        {product.tag && (
          <span className={`absolute top-4 left-4 z-10 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-md ${
            product.tag === 'Best Seller' ? 'bg-brand-orange' : product.tag === 'Tech' ? 'bg-purple-500' : 'bg-brand-dark'
          }`}>
            {product.tag}
          </span>
        )}
        
        {/* Wishlist Button */}
        <button className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-brand-pink transition-all shadow-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300">
          <Heart size={20} />
        </button>

        {/* Image Handling */}
        {!imgError ? (
          <img 
            src={product.image} 
            alt={product.name} 
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
             <Dog size={48} className="mb-2 opacity-20" />
             <span className="font-bold text-xs uppercase tracking-widest opacity-60">Image Coming Soon</span>
          </div>
        )}
        
        {/* Add to Cart Button (Slides up) */}
        <div className="absolute inset-x-4 bottom-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button 
            onClick={() => addToCart(product)} 
            className="w-full bg-brand-dark text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-brand-teal transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="text-center px-2">
         <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-teal transition-colors font-display">{product.name}</h3>
         <p className="text-gray-500 text-sm mt-1">{product.category === 'snack' ? '100% Natural Treats' : 'Durable Dog Toy'}</p>
         <div className="mt-3 text-xl font-extrabold text-brand-orange">£{product.price.toFixed(2)}</div>
      </div>
    </div>
  );
};

export const Shop: React.FC<ShopProps> = ({ addToCart }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'snack' | 'toy'>('all');

  const bannerImages = {
    all: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?ixlib=rb-1.2.1&auto=format&fit=crop&w=2100&q=80", 
    snack: "https://images.unsplash.com/photo-1582798358481-d29e2058e601?ixlib=rb-1.2.1&auto=format&fit=crop&w=2100&q=80", 
    toy: "https://images.unsplash.com/photo-1534361960057-19889db9621e?ixlib=rb-1.2.1&auto=format&fit=crop&w=2100&q=80" 
  };

  const products: Product[] = [
    // --- SNACKS ---
    {
      id: 's1', name: 'Salmon Delight', category: 'snack', price: 6.50,
      image: 'https://images.unsplash.com/photo-1599141014169-23c349377a06?auto=format&fit=crop&w=800&q=80',
      description: '100% Natural Salmon (70%) with veggies.', tag: 'Best Seller'
    },
    {
      id: 's2', name: 'Liver Luxury', category: 'snack', price: 5.99,
      image: 'https://images.unsplash.com/photo-1623366302587-bca021d6616c?auto=format&fit=crop&w=800&q=80',
      description: 'Rich Beef Liver (70%) combined with wholesome vegetables.',
    },
    {
      id: 's3', name: 'Beef Bonanza', category: 'snack', price: 6.20,
      image: 'https://images.unsplash.com/photo-1541592618-3aee694856f6?auto=format&fit=crop&w=800&q=80',
      description: 'Human-grade Beef (70%) and veggies.',
    },
    {
      id: 's4', name: 'Chicken & Veggie', category: 'snack', price: 5.99,
      image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80',
      description: 'Lean Chicken Breast (70%) with nutrient-rich broccoli.',
    },
    {
      id: 's5', name: 'Lamb Love', category: 'snack', price: 6.50,
      image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?auto=format&fit=crop&w=800&q=80',
      description: 'Hypoallergenic Lamb (70%). Gentle on sensitive stomachs.', tag: 'Sensitive'
    },
    {
      id: 's6', name: 'Garden Veggies', category: 'snack', price: 5.50,
      image: 'https://images.unsplash.com/photo-1592394533824-9436d7d25d41?auto=format&fit=crop&w=800&q=80',
      description: '100% Plant-based goodness.', tag: 'Vegan'
    },
    
    // --- TOYS ---
    {
      id: 't1', name: 'Tire Chew', category: 'toy', price: 12.99,
      image: 'https://images.unsplash.com/photo-1615266895738-11f1371cd7e5?auto=format&fit=crop&w=800&q=80', 
      description: 'Heavy duty rubber tire.', tag: 'Tough'
    },
    {
      id: 't2', name: 'Plush Fox', category: 'toy', price: 8.50,
      image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80',
      description: 'No-stuffing plush toy with 2 squeakers.',
    },
    {
      id: 't3', name: 'Dental Rope', category: 'toy', price: 7.99,
      image: 'https://images.unsplash.com/photo-1599147515250-13f508a8e32c?auto=format&fit=crop&w=800&q=80',
      description: 'Cleans teeth while playing! Mint-scented.',
    },
    {
      id: 't4', name: 'Puzzle Feeder', category: 'toy', price: 15.99,
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80',
      description: 'Mental stimulation game.', tag: 'Smart'
    },
    {
      id: 't5', name: 'Rubber Ball', category: 'toy', price: 5.99,
      image: 'https://images.unsplash.com/photo-1555543779-7dd817830b42?auto=format&fit=crop&w=800&q=80',
      description: 'High-bounce ball that floats!',
    },
    {
      id: 't6', name: 'Frisbee Flyer', category: 'toy', price: 8.99,
      image: 'https://images.unsplash.com/photo-1563225528-912a7a400a45?auto=format&fit=crop&w=800&q=80',
      description: 'Aerodynamic and soft on teeth.',
    },
    {
      id: 't7', name: 'Tug-o-War Rope', category: 'toy', price: 10.50,
      image: 'https://images.unsplash.com/photo-1615266895711-536eb7e7b702?auto=format&fit=crop&w=800&q=80',
      description: 'Extra long 3-knot rope.', tag: 'Interactive'
    },
    {
      id: 't8', name: 'Squeaky Hedgehog', category: 'toy', price: 9.99,
      image: 'https://images.unsplash.com/photo-1535930749574-1399327ce78f?auto=format&fit=crop&w=800&q=80',
      description: 'Soft plush with a durable internal squeaker.',
    },
    {
      id: 't9', name: 'Indestructible Bone', category: 'toy', price: 14.50,
      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
      description: 'Nylon infused with bacon flavor.', tag: 'Tough'
    },
    {
      id: 't10', name: 'Agility Tunnel', category: 'toy', price: 35.00,
      image: 'https://images.unsplash.com/photo-1518914781460-a3daa4c06f27?auto=format&fit=crop&w=800&q=80',
      description: 'Foldable tunnel for backyard training.',
    },
    {
      id: 't11', name: 'Snuffle Mat XL', category: 'toy', price: 22.00,
      image: 'https://images.unsplash.com/photo-1529927066849-79b791a698f5?auto=format&fit=crop&w=800&q=80',
      description: 'Hide kibble in the fabric strips.', tag: 'Brain Game'
    },
    {
      id: 't12', name: 'Rubber Chicken', category: 'toy', price: 4.99,
      image: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=800&q=80',
      description: 'The classic hilarious squeaking toy.',
    },
    {
      id: 't13', name: 'Water Floater', category: 'toy', price: 11.50,
      image: 'https://images.unsplash.com/photo-1575485670541-82a2b0cb0e25?auto=format&fit=crop&w=800&q=80',
      description: 'Bright orange ring that never sinks.',
    },
    {
      id: 't14', name: 'Plush Donut', category: 'toy', price: 7.50,
      image: 'https://images.unsplash.com/photo-1608408843596-f311c750e4a1?auto=format&fit=crop&w=800&q=80',
      description: 'Cute, soft, and perfect for cuddling.',
    },
    {
      id: 't15', name: 'Spiky Ball', category: 'toy', price: 6.00,
      image: 'https://images.unsplash.com/photo-1598133893773-de35d966f014?auto=format&fit=crop&w=800&q=80',
      description: 'Massages gums while they chew.',
    },
    {
      id: 't16', name: 'Automatic Launcher', category: 'toy', price: 45.00,
      image: 'https://images.unsplash.com/photo-1453227588063-bb302b62f50b?auto=format&fit=crop&w=800&q=80',
      description: 'Launches tennis balls automatically.', tag: 'Tech'
    }
  ];

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="bg-white min-h-screen">
      
      {/* DYNAMIC SHOP HEADER */}
      <div className="relative h-[50vh] bg-brand-teal flex items-center justify-center overflow-hidden transition-all duration-700">
         <div className="absolute inset-0 mix-blend-multiply opacity-40 transition-opacity duration-500">
            <img 
              key={activeCategory} 
              src={bannerImages[activeCategory]} 
              alt="Category Banner" 
              className="w-full h-full object-cover object-center animate-fade-in" 
            />
         </div>
         
         <div className="absolute inset-0 bg-gradient-to-t from-brand-teal via-transparent to-brand-teal/20"></div>
         
         <div className="relative z-10 text-center max-w-4xl px-4">
            <p className="text-white font-bold tracking-[0.2em] uppercase mb-4 text-sm md:text-base drop-shadow-md">The Collection</p>
            <h2 className="text-6xl md:text-8xl font-display font-extrabold text-white drop-shadow-lg mb-2 capitalize leading-tight">
               {activeCategory === 'all' ? (
                 <>Maria's <span className="text-brand-yellow">Favorites</span></>
               ) : activeCategory === 'snack' ? (
                 <>Premium <span className="text-brand-yellow">Rewards</span></>
               ) : (
                 <>Active <span className="text-brand-yellow">Play</span></>
               )}
            </h2>
            <p className="text-teal-50 text-lg md:text-xl font-medium max-w-2xl mx-auto mt-4 drop-shadow-sm">
              {activeCategory === 'all' 
                ? "Browse our curated selection of veterinary-approved snacks and indestructible toys."
                : activeCategory === 'snack'
                ? "100% natural, air-dried ingredients. No fillers, no nasties—just pure nutrition."
                : "Engineered for durability and mental stimulation. Keep your dog happy and engaged."}
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

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Filter Tabs */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex bg-gray-100 p-1.5 rounded-full shadow-inner">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'snack', label: 'Healthy Snacks' },
              { id: 'toy', label: 'Durable Toys' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-8 py-3 rounded-full text-sm md:text-base font-bold transition-all duration-300 ${
                  activeCategory === cat.id 
                    ? 'bg-brand-dark text-white shadow-lg transform scale-105' 
                    : 'text-gray-500 hover:text-brand-dark hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} addToCart={addToCart} />
          ))}
        </div>

      </div>
    </div>
  );
};