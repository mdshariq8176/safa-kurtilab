'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { ShoppingBag, Search, Menu, X, ChevronDown, User, ShieldCheck } from 'lucide-react';
import CartDrawer from '@/components/shop/CartDrawer';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function Navbar() {
  const { itemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass border-b border-gold-primary/10 shadow-sm">
        {/* Top Info Banner */}
        <div className="bg-emerald-primary text-[#f3d065] text-[10px] sm:text-xs font-semibold py-1.5 px-4 text-center tracking-widest uppercase">
          Complimentary Luxury Packaging & Free Shipping Across India | B2B Portal Enabled
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -ml-2 text-charcoal hover:text-emerald-primary md:hidden transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Luxury Brand Logo */}
          <div className="flex-1 md:flex-none text-center md:text-left">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl sm:text-3xl font-extrabold tracking-widest uppercase text-emerald-primary hover:text-emerald-light transition-colors">
                Safa <span className="text-gold-primary">Kurtilab</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wider uppercase text-charcoal/80">
            <Link href="/" className="hover:text-emerald-primary transition-colors">
              Home
            </Link>
            
            {/* MegaMenu Dropdown Trigger */}
            <div
              className="relative py-4 cursor-pointer"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <button className="hover:text-emerald-primary transition-colors flex items-center gap-1">
                Collections <ChevronDown className="w-3.5 h-3.5 mt-0.5" />
              </button>

              <AnimatePresence>
                {isMegaMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-1/2 -translate-x-1/2 top-full w-[500px] bg-white border border-gold-primary/25 rounded-lg shadow-xl p-6 grid grid-cols-2 gap-6 z-50 text-left cursor-default"
                  >
                    <div>
                      <h4 className="font-serif text-xs font-bold text-emerald-primary border-b border-gold-primary/10 pb-2 mb-3 uppercase tracking-wider">
                        Categories
                      </h4>
                      <ul className="space-y-2 text-xs text-charcoal/70">
                        <li>
                          <Link href="/products?category=Anarkali" className="hover:text-gold-dark transition-colors block py-0.5">
                            Anarkali Suits (Royal Flare)
                          </Link>
                        </li>
                        <li>
                          <Link href="/products?category=Straight Cut" className="hover:text-gold-dark transition-colors block py-0.5">
                            Straight Cut Kurtis (Premium Silk)
                          </Link>
                        </li>
                        <li>
                          <Link href="/products?category=A-Line" className="hover:text-gold-dark transition-colors block py-0.5">
                            A-Line Formals (Rich Velvet)
                          </Link>
                        </li>
                        <li>
                          <Link href="/products" className="hover:text-gold-dark transition-colors block py-0.5 font-semibold text-emerald-primary mt-1">
                            Browse All Styles &rarr;
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-serif text-xs font-bold text-emerald-primary border-b border-gold-primary/10 pb-2 mb-3 uppercase tracking-wider">
                        Occasions
                      </h4>
                      <ul className="space-y-2 text-xs text-charcoal/70">
                        <li>
                          <Link href="/products?discount=10" className="hover:text-gold-dark transition-colors block py-0.5">
                            Festive Special (Min. 10% Off)
                          </Link>
                        </li>
                        <li>
                          <Link href="/products" className="hover:text-gold-dark transition-colors block py-0.5">
                            Daily Sophistication
                          </Link>
                        </li>
                        <li>
                          <Link href="/products" className="hover:text-gold-dark transition-colors block py-0.5">
                            Wedding & Trousseau Essentials
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/products" className="hover:text-emerald-primary transition-colors">
              Store
            </Link>
            <Link href="/admin" className="hover:text-emerald-primary transition-colors flex items-center gap-1 text-gold-dark font-semibold">
              <ShieldCheck className="w-4 h-4" /> Admin Center
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            {/* Search Icon button */}
            <Link href="/products" className="p-2 text-charcoal hover:text-emerald-primary transition-colors">
              <Search className="w-5.5 h-5.5" />
            </Link>

            {/* Customer Login Shortcut */}
            <Link 
              href="/login" 
              className="p-2 text-charcoal hover:text-emerald-primary transition-colors flex items-center gap-1.5" 
              title={authUser ? `Profile: ${authUser.email || authUser.phone}` : "Customer Login"}
            >
              <User className={`w-5.5 h-5.5 ${authUser ? 'text-emerald-primary stroke-[2]' : ''}`} />
              {authUser && (
                <span className="hidden lg:inline text-[10px] font-bold uppercase tracking-wider text-emerald-primary">
                  {authUser.user_metadata?.name || 'Client'}
                </span>
              )}
            </Link>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-emerald-primary hover:bg-emerald-light text-white rounded-full transition-all shadow hover:shadow-md flex items-center justify-center"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gold-primary text-charcoal font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-alabaster">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden cursor-pointer"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-4/5 max-w-[300px] bg-alabaster z-40 p-6 shadow-2xl flex flex-col border-r border-gold-primary/20 md:hidden"
            >
              <div className="flex justify-between items-center pb-6 border-b border-gold-primary/10">
                <span className="font-serif text-xl font-bold text-emerald-primary">
                  Safa <span className="text-gold-primary">Kurtilab</span>
                </span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-gold-primary/10 rounded-full">
                  <X className="w-6 h-6 text-charcoal" />
                </button>
              </div>
              <nav className="flex-1 flex flex-col py-6 space-y-4 text-sm font-medium tracking-wider uppercase text-charcoal/80">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-primary transition-colors py-2 border-b border-gold-primary/5">
                  Home
                </Link>
                <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-primary transition-colors py-2 border-b border-gold-primary/5">
                  Shop Catalog
                </Link>
                <Link href="/products?category=Anarkali" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-primary transition-colors py-2 border-b border-gold-primary/5 pl-2 text-xs">
                  - Anarkali Collection
                </Link>
                <Link href="/products?category=Straight%20Cut" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-primary transition-colors py-2 border-b border-gold-primary/5 pl-2 text-xs">
                  - Straight Cut Collection
                </Link>
                <Link href="/products?category=A-Line" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-primary transition-colors py-2 border-b border-gold-primary/5 pl-2 text-xs">
                  - A-Line Velvet Collection
                </Link>
                <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-primary transition-colors py-2 text-gold-dark font-semibold">
                  Admin Dashboard
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Drawer sliding sidebar overlay */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
