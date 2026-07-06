'use client';

import { useCart } from '@/hooks/useCart';
import { X, Plus, Minus, Trash2, ShoppingBag, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, cartTotal, grandTotal, itemCount } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Cart Panel Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-alabaster shadow-2xl z-50 flex flex-col border-l border-gold-primary/20"
          >
            {/* Header */}
            <div className="p-6 border-b border-gold-primary/10 flex items-center justify-between bg-emerald-primary text-white">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gold-primary" />
                <h2 className="text-xl font-serif font-semibold tracking-wide">Your Trousseau ({itemCount})</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-emerald-light rounded-full transition-colors text-white/80 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <ShoppingBag className="w-16 h-16 text-gold-primary/40 stroke-[1]" />
                  <div>
                    <h3 className="font-serif text-lg font-medium text-charcoal">Your cart is empty</h3>
                    <p className="text-sm text-charcoal/60 mt-1">Begin adding our luxury Kurti designs to start shopping.</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-emerald-primary text-white text-sm font-medium tracking-wide hover:bg-emerald-light transition-all rounded shadow-md hover:shadow-lg"
                  >
                    Browse Collections
                  </button>
                </div>
              ) : (
                items.map((item) => {
                  const itemSubtotal = (item.price - (item.price * item.discount) / 100) * item.quantity;
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-4 p-4 bg-white border border-gold-primary/10 rounded-lg shadow-sm hover:shadow transition-shadow"
                    >
                      {/* Product Thumbnail */}
                      <div className="relative w-20 h-24 bg-alabaster rounded overflow-hidden flex-shrink-0 border border-gold-primary/5">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Item details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-serif text-sm font-semibold text-charcoal line-clamp-1">
                              {item.title}
                            </h4>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-charcoal/40 hover:text-red-600 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex gap-3 text-xs text-charcoal/60 mt-1">
                            <span>Size: <strong className="text-charcoal font-semibold">{item.size}</strong></span>
                            <span>Color: <strong className="text-charcoal font-semibold">{item.color}</strong></span>
                          </div>
                        </div>

                        {/* Quantity and Price */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gold-primary/20 rounded bg-alabaster">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-gold-primary/10 transition-colors text-charcoal/80"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-semibold text-charcoal min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-gold-primary/10 transition-colors text-charcoal/80"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="text-right">
                            {item.discount > 0 && (
                              <span className="text-xs text-charcoal/40 line-through mr-1.5">
                                ₹{item.price * item.quantity}
                              </span>
                            )}
                            <span className="text-sm font-semibold text-emerald-primary">
                              ₹{itemSubtotal.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Price breakdown and Checkout Area */}
            {items.length > 0 && (
              <div className="p-6 border-t border-gold-primary/20 bg-white space-y-4">
                <div className="space-y-2.5 text-sm text-charcoal">
                  <div className="flex justify-between">
                    <span className="text-charcoal/60">Cart Subtotal</span>
                    <span className="font-semibold">₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal/60">Estimated GST (5%)</span>
                    <span className="font-semibold">₹{grandTotal * 0.05 / 1.05 ? (grandTotal - cartTotal).toLocaleString('en-IN') : '0'}</span>
                  </div>
                  <div className="h-px bg-gold-primary/10 my-2" />
                  <div className="flex justify-between text-base font-serif font-bold text-charcoal">
                    <span>Grand Total</span>
                    <span className="text-emerald-primary">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* MOQ Validation warning or Checkout button */}
                {!(itemCount >= 5 || cartTotal >= 5000) ? (
                  <div className="space-y-3">
                    <div className="p-3.5 bg-red-50 border border-red-100 rounded-lg text-[11px] leading-relaxed text-red-600 font-semibold text-center space-y-1">
                      <p className="uppercase tracking-widest text-[9px] text-red-700 font-bold flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> B2B Wholesale MOQ Alert
                      </p>
                      <p>Checkout requires at least <strong>5 items</strong> OR a minimum subtotal of <strong>₹5,000</strong>.</p>
                      <p className="text-[10px] text-red-500 font-medium">Current: {itemCount} items / Subtotal: ₹{cartTotal.toLocaleString('en-IN')}</p>
                    </div>
                    <button className="w-full py-3.5 bg-charcoal/10 border border-charcoal/5 text-charcoal/40 text-sm font-medium tracking-widest uppercase rounded cursor-not-allowed flex items-center justify-center gap-2">
                      Proceed to Checkout
                    </button>
                  </div>
                ) : (
                  <Link href="/checkout" onClick={onClose} className="block w-full">
                    <button className="w-full py-3.5 bg-emerald-primary hover:bg-emerald-light text-white text-sm font-medium tracking-widest uppercase transition-all rounded shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                      Proceed to Checkout
                    </button>
                  </Link>
                )}
                <button
                  onClick={onClose}
                  className="w-full text-center text-xs font-semibold text-gold-dark hover:underline tracking-wider uppercase"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
