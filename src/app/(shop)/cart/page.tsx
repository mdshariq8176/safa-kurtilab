'use client';

import { useCartStore } from '@/hooks/useCart';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Trash2, ArrowRight, Package } from 'lucide-react';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getCartTotal = useCartStore((s) => s.getCartTotal);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const getGrandTotal = useCartStore((s) => s.getGrandTotal);
  const getGSTAmount = useCartStore((s) => s.getGSTAmount);

  const total = getCartTotal();
  const itemCount = getItemCount();
  const grandTotal = getGrandTotal();
  const gstAmount = getGSTAmount();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 text-charcoal/20 mx-auto mb-6" />
        <h1 className="font-serif text-3xl font-bold text-charcoal mb-3">Your Cart is Empty</h1>
        <p className="text-charcoal/60 mb-8 text-sm">
          Discover our premium B2B catalog and add products to your order.
        </p>
        <Link href="/products">
          <button
            id="browse-catalog-btn"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-primary hover:bg-emerald-light text-white font-semibold text-xs tracking-widest uppercase rounded transition-colors shadow-lg"
          >
            Browse Catalog <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-charcoal">Your Order Cart</h1>
        <p className="text-charcoal/60 text-sm mt-1">
          {itemCount} item{itemCount !== 1 ? 's' : ''} selected
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 bg-white rounded-xl border border-gold-primary/10 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-alabaster">
                <Image
                  src={item.image || '/images/logo.jpg'}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-sm font-semibold text-charcoal leading-snug line-clamp-2">
                  {item.title}
                </h3>
                <div className="flex gap-3 mt-1 text-xs text-charcoal/50">
                  {item.size && <span>Size: {item.size}</span>}
                  {item.color && item.color !== 'Default' && <span>Color: {item.color}</span>}
                  {item.setRatio && (
                    <span className="text-gold-dark">Ratio: {item.setRatio}</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-0 border border-gold-primary/20 rounded-lg overflow-hidden">
                    <button
                      id={`decrease-qty-${item.id}`}
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="px-3 py-1.5 text-charcoal hover:bg-gold-primary/10 transition-colors text-sm font-bold"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 text-sm font-semibold border-x border-gold-primary/20">
                      {item.quantity}
                    </span>
                    <button
                      id={`increase-qty-${item.id}`}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1.5 text-charcoal hover:bg-gold-primary/10 transition-colors text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold text-emerald-primary text-sm">
                    ₹{((item.price * item.quantity) * (1 - item.discount / 100)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <button
                id={`remove-item-${item.id}`}
                onClick={() => removeItem(item.id)}
                className="p-2 text-charcoal/30 hover:text-red-500 transition-colors self-start"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gold-primary/15 p-6 shadow-sm sticky top-28">
            <h2 className="font-serif text-lg font-bold text-charcoal mb-4 pb-3 border-b border-gold-primary/10">
              Order Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-charcoal/70">
                <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                <span className="font-semibold text-charcoal">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-charcoal/70">
                <span>GST (5%)</span>
                <span>₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-charcoal/70">
                <span>Shipping</span>
                <span className="text-emerald-primary font-semibold">Free</span>
              </div>
              <div className="border-t border-gold-primary/10 pt-3 flex justify-between text-base font-bold text-charcoal">
                <span>Total</span>
                <span className="text-emerald-primary">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link href="/checkout" className="block">
                <button
                  id="proceed-to-checkout-btn"
                  className="w-full py-3.5 bg-emerald-primary hover:bg-emerald-light text-white font-bold text-xs tracking-widest uppercase rounded transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <a
                href={`https://wa.me/917003518485?text=Hi%20Safa%20Kurtilab!%20I%20want%20to%20place%20a%20B2B%20order.%20${itemCount}%20items%2C%20Total%3A%20%E2%82%B9${grandTotal.toLocaleString('en-IN')}`}
                target="_blank"
                rel="noopener noreferrer"
                id="whatsapp-order-cart-btn"
              >
                <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-xs tracking-widest uppercase rounded transition-colors flex items-center justify-center gap-2">
                  <Package className="w-4 h-4" />
                  WhatsApp Order
                </button>
              </a>
              <Link
                href="/products"
                className="block text-center text-xs text-charcoal/50 hover:text-emerald-primary transition-colors pt-1"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
