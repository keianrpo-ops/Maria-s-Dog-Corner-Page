import React from 'react';
import { X, Plus, Minus, CreditCard, MessageCircle, Trash2, CalendarCheck } from 'lucide-react';
import { CartItem } from '../types';
import { Button } from './Button';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
}

export const CartModal: React.FC<CartModalProps> = ({ 
  isOpen, 
  onClose, 
  cart, 
  updateQuantity, 
  removeFromCart 
}) => {
  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleStripeCheckout = async () => {
  try {
    console.log("Initiating Stripe Checkout for items:", cart);

    const response = await fetch("/api/payment/create-snacks-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart }),
    });

    const data = await response.json();

    if (!response.ok || !data.checkoutUrl) {
      throw new Error(data?.error || "Failed to create Stripe checkout session");
    }

    window.open(data.checkoutUrl, "_blank"); // o window.location.href = data.checkoutUrl;
  } catch (error: any) {
    console.error(error);
    alert(`Error starting Stripe checkout: ${error.message || "Unknown error"}`);
  }
};


  const handleWhatsAppCheckout = () => {
    const message = cart.map(item => `${item.quantity}x ${item.name} (£${item.price})`).join('%0A');
    const totalMsg = `Total: £${total.toFixed(2)}`;
    // Using the real provided phone number: 07594 562 006 -> 447594562006
    const url = `https://wa.me/447594562006?text=Hi Maria, I'd like to book/order:%0A%0A${message}%0A%0A${totalMsg}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md transform transition-transform ease-in-out duration-500 bg-white shadow-2xl flex flex-col h-full">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-brand-light">
            <h2 className="text-xl font-display font-bold text-brand-dark">Your Cart</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X size={24} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <CreditCard size={32} className="opacity-30" />
                </div>
                <p>Your cart is empty.</p>
                <Button onClick={onClose} variant="outline" size="sm">Start Shopping</Button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.currentTarget.src = "https://placehold.co/150x150/00C2CB/FFFFFF?text=Service"; }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-sm">{item.name}</h3>
                    <p className="text-brand-orange font-bold">£{item.price.toFixed(2)}</p>
                    {item.id.startsWith('svc-') && (
                       <span className="text-[10px] bg-brand-light text-brand-dark px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
                          <CalendarCheck size={10} /> Service
                       </span>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1 border border-gray-200">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-gray-600 hover:text-brand-red shadow-sm disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-brand-teal shadow-sm"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t border-gray-100 p-6 bg-gray-50 space-y-4">
              <div className="flex justify-between items-center text-lg font-bold text-brand-dark">
                <span>Total</span>
                <span>£{total.toFixed(2)}</span>
              </div>
              
              <button
             onClick={handleStripeCheckout}
              className="w-full py-4 rounded-xl bg-[#635BFF] hover:opacity-90 text-white font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg"
              >
                <CreditCard size={20} />
              Checkout (Stripe)
                </button>

              
              <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Or</span>
                  <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <button 
                onClick={handleWhatsAppCheckout}
                className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-green-200"
              >
                <MessageCircle size={20} />
                Order via WhatsApp
              </button>
              
            <p className="text-xs text-center text-gray-400 mt-2">
            Secure checkout powered by Stripe.
          </p>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};