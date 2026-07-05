'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

export default function Footer() {
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for subscribing to Safa Kurtilab. You will now receive private catalog listings.');
  };

  return (
    <footer className="bg-emerald-dark text-white border-t border-gold-primary/20 mt-auto">
      {/* Newsletter signup area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-gold-primary/10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2">
            <h3 className="font-serif text-2xl font-semibold tracking-wide">Subscribe to our Private Catalog</h3>
            <p className="text-sm text-white/60 mt-1 max-w-xl">
              Be the first to receive updates on limited-edition collection launches, luxury B2B exhibitions, and seasonal pricing.
            </p>
          </div>
          <div>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email address"
                required
                className="flex-1 px-4 py-2.5 bg-emerald-primary/40 border border-gold-primary/20 text-white rounded focus:outline-none focus:border-gold-primary text-sm placeholder-white/40"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-gold-primary hover:bg-gold-light text-charcoal font-semibold text-xs tracking-wider uppercase rounded transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="space-y-4">
          <h4 className="font-serif text-2xl font-bold tracking-widest uppercase">
            Safa <span className="text-gold-primary">Kurtilab</span>
          </h4>
          <p className="text-xs text-white/60 leading-relaxed">
            Defining premium ethnic wear since 2012. Handcrafted Kurta and Anarkali suit sets woven from pure fabrics for weddings, festivities, and sophisticated daily wear.
          </p>
          <div className="flex gap-4 text-white/50 text-xs">
            <span>© {new Date().getFullYear()} Safa Kurtilab. All Rights Reserved.</span>
          </div>
        </div>

        {/* Shop columns */}
        <div>
          <h5 className="font-serif text-sm font-semibold text-[#f3d065] tracking-wider uppercase mb-4">
            Collections
          </h5>
          <ul className="space-y-2.5 text-xs text-white/70">
            <li>
              <Link href="/products?category=Anarkali" className="hover:text-gold-primary transition-colors">
                Anarkali Flare Suit Sets
              </Link>
            </li>
            <li>
              <Link href="/products?category=Straight Cut" className="hover:text-gold-primary transition-colors">
                Straight Cut Silk Kurtas
              </Link>
            </li>
            <li>
              <Link href="/products?category=A-Line" className="hover:text-gold-primary transition-colors">
                A-Line Velvet Tunics
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-gold-primary transition-colors">
                New Arrivals catalog
              </Link>
            </li>
          </ul>
        </div>

        {/* Corporate columns */}
        <div>
          <h5 className="font-serif text-sm font-semibold text-[#f3d065] tracking-wider uppercase mb-4">
            Business & B2B
          </h5>
          <ul className="space-y-2.5 text-xs text-white/70">
            <li>
              <Link href="/checkout" className="hover:text-gold-primary transition-colors">
                Corporate Orders Portal
              </Link>
            </li>
            <li>
              <Link href="/checkout" className="hover:text-gold-primary transition-colors">
                GSTIN Billing Verification
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-gold-primary transition-colors">
                Admin Command Center
              </Link>
            </li>
            <li>
              <span className="text-[#f3d065] font-semibold">GST Registered Billing</span>
            </li>
          </ul>
        </div>

        {/* Legal columns */}
        <div>
          <h5 className="font-serif text-sm font-semibold text-[#f3d065] tracking-wider uppercase mb-4">
            Legal & Policies
          </h5>
          <ul className="space-y-2.5 text-xs text-white/70">
            <li>
              <Link href="/policies/terms" className="hover:text-gold-primary transition-colors">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/policies/privacy" className="hover:text-gold-primary transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/policies/refund" className="hover:text-gold-primary transition-colors">
                Return & Refund Policy
              </Link>
            </li>
            <li>
              <Link href="/policies/shipping" className="hover:text-gold-primary transition-colors">
                Shipping & Delivery Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact info column */}
        <div className="space-y-4">
          <h5 className="font-serif text-sm font-semibold text-[#f3d065] tracking-wider uppercase mb-2">
            Maison Safa
          </h5>
          <ul className="space-y-3 text-xs text-white/70">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-gold-primary flex-shrink-0 mt-0.5" />
              <span>Plot 28, Shahpur Jat Design District, New Delhi, 110049, India</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-gold-primary flex-shrink-0" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-gold-primary flex-shrink-0" />
              <span>concierge@safakurtilab.com</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-gold-primary flex-shrink-0" />
              <span>www.safakurtilab.com</span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
