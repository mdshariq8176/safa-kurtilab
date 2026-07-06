'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/hooks/useCart';
import { Star, Shield, Truck, RotateCcw, AlertTriangle, Sparkles, Ruler } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Variant {
  id: string;
  size: string;
  color: string;
  stock: number;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  discount: number;
  images: string;
  category: string;
  variants: Variant[];
}

interface ProductDetailsClientProps {
  product: Product;
}

  export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const addItem = useCartStore((state) => state.addItem);

  // Group unique colors and sizes available
  const availableColors = Array.from(new Set(product.variants.map((v) => v.color)));
  const availableSizes = Array.from(new Set(product.variants.map((v) => v.size)));

  // State managers
  const [selectedColor, setSelectedColor] = useState(availableColors[0] || '');
  const [selectedSize, setSelectedSize] = useState(availableSizes[0] || '');
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'care'>('desc');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isAddedSuccessfully, setIsAddedSuccessfully] = useState(false);

  // Calculate pricing
  const discountAmt = product.basePrice * (product.discount / 100);
  const salePrice = product.basePrice - discountAmt;
  const hasDiscount = product.discount > 0;

  // Retrieve current stock level for the selected variant
  const currentVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );
  const variantStock = currentVariant ? currentVariant.stock : 0;
  const isOutOfStock = variantStock === 0;
  const isLowStock = variantStock > 0 && variantStock < 5;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    // Add to cart state
    addItem({
      productId: product.id,
      title: product.title,
      price: product.basePrice,
      discount: product.discount,
      image: product.images,
      size: selectedSize,
      color: selectedColor,
    });

    // Alert successful addition with animated drawer trigger
    setIsAddedSuccessfully(true);
    setTimeout(() => setIsAddedSuccessfully(false), 2500);

    // Open standard cart drawer (simulate navbar click)
    const cartButton = document.querySelector('button[class*="bg-emerald-primary"]') as HTMLButtonElement;
    if (cartButton) cartButton.click();
  };

  return (
    <div className="space-y-12">
      {/* 1. Upper Product Info Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Gallery column */}
        <div className="md:col-span-6">
          <div className="relative aspect-[3/4] w-full rounded-2xl border border-gold-primary/10 overflow-hidden bg-alabaster shadow-sm">
            <Image
              src={product.images}
              alt={product.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Configurations column */}
        <div className="md:col-span-6 space-y-6">
          {/* Header metadata */}
          <div className="space-y-2">
            <span className="text-[10px] text-gold-dark font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Safa Luxe Silhouette
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">{product.title}</h1>
            <div className="flex gap-3 items-center">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="text-xs text-charcoal/50 font-semibold">(4.9/5 Based on 42 Ratings)</span>
            </div>
          </div>

          {/* Pricing area */}
          <div className="p-4 bg-white border border-gold-primary/10 rounded-xl flex items-center gap-4">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-xs text-charcoal/40 line-through">MRP ₹{product.basePrice}</span>
              )}
              <span className="text-2xl font-bold text-emerald-primary">
                ₹{salePrice.toLocaleString('en-IN')}
              </span>
            </div>
            {hasDiscount && (
              <span className="bg-emerald-primary text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest rounded">
                Save {product.discount}%
              </span>
            )}
            <span className="text-[10px] text-charcoal/50 font-medium ml-auto">Inclusive of all local taxes</span>
          </div>

          {/* Colors Selection Swatch */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-charcoal/70 uppercase tracking-wider block">
              Selected Colorway: <strong className="text-charcoal">{selectedColor}</strong>
            </label>
            <div className="flex gap-3">
              {availableColors.map((color) => {
                const isActive = selectedColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded text-xs font-semibold uppercase transition-all ${
                      isActive
                        ? 'border-emerald-primary bg-emerald-primary/5 text-emerald-primary shadow-sm'
                        : 'border-gold-primary/20 hover:border-gold-primary text-charcoal/70 bg-white'
                    }`}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sizes Selection Swatch */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-charcoal/70 uppercase tracking-wider block">
                Selected Size: <strong className="text-charcoal">{selectedSize}</strong>
              </label>
              <button
                onClick={() => setIsSizeGuideOpen(true)}
                className="flex items-center gap-1 text-[10px] font-bold text-gold-dark hover:text-emerald-primary uppercase tracking-wider transition-colors"
              >
                <Ruler className="w-3.5 h-3.5" /> Size Guide
              </button>
            </div>
            <div className="flex gap-2">
              {availableSizes.map((size) => {
                const isActive = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-10 h-10 border rounded text-xs font-bold transition-all ${
                      isActive
                        ? 'border-emerald-primary bg-emerald-primary text-white shadow'
                        : 'border-gold-primary/20 hover:border-gold-primary text-charcoal bg-white'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock Availability Indicator */}
          <div className="h-6">
            {isOutOfStock ? (
              <span className="text-xs font-semibold text-red-600 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Out of stock. Choose another variant.
              </span>
            ) : isLowStock ? (
              <span className="text-xs font-semibold text-amber-600 flex items-center gap-1.5 animate-pulse">
                <AlertTriangle className="w-4 h-4" /> Only {variantStock} pieces left. Secure yours now!
              </span>
            ) : (
              <span className="text-xs font-semibold text-green-700">
                In stock (Ready to ship from Design Studio)
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAddedSuccessfully}
              className={`flex-1 py-4 font-bold text-xs tracking-widest uppercase transition-all rounded shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                isOutOfStock
                  ? 'bg-charcoal/10 text-charcoal/40 cursor-not-allowed border border-charcoal/5 shadow-none'
                  : 'bg-emerald-primary hover:bg-emerald-light text-white'
              }`}
            >
              {isOutOfStock ? 'Sold Out' : isAddedSuccessfully ? 'Added to Trousseau!' : 'Add to Bag'}
            </button>
          </div>

          {/* Luxury Brand Assurances */}
          <div className="grid grid-cols-3 gap-4 border-t border-gold-primary/15 pt-6 text-[10px] text-charcoal/60 uppercase font-semibold text-center">
            <div className="flex flex-col items-center gap-1">
              <Shield className="w-5 h-5 text-gold-primary" />
              <span>100% Pure Silk/Velvet</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-5 h-5 text-gold-primary" />
              <span>Express Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw className="w-5 h-5 text-gold-primary" />
              <span>Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Tabs Section */}
      <div className="bg-white border border-gold-primary/10 rounded-xl p-6 md:p-8 shadow-sm">
        {/* Navigation tabs header */}
        <div className="flex border-b border-gold-primary/10 pb-4 gap-8 text-xs font-bold uppercase tracking-widest text-charcoal/50">
          <button
            onClick={() => setActiveTab('desc')}
            className={`transition-colors relative pb-4 -mb-4 ${
              activeTab === 'desc' ? 'text-emerald-primary' : 'hover:text-charcoal'
            }`}
          >
            Design Detail
            {activeTab === 'desc' && (
              <motion.span layoutId="tab-underline" className="absolute left-0 right-0 bottom-0 h-0.5 bg-emerald-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`transition-colors relative pb-4 -mb-4 ${
              activeTab === 'specs' ? 'text-emerald-primary' : 'hover:text-charcoal'
            }`}
          >
            Material Specs
            {activeTab === 'specs' && (
              <motion.span layoutId="tab-underline" className="absolute left-0 right-0 bottom-0 h-0.5 bg-emerald-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('care')}
            className={`transition-colors relative pb-4 -mb-4 ${
              activeTab === 'care' ? 'text-emerald-primary' : 'hover:text-charcoal'
            }`}
          >
            Studio & Care
            {activeTab === 'care' && (
              <motion.span layoutId="tab-underline" className="absolute left-0 right-0 bottom-0 h-0.5 bg-emerald-primary" />
            )}
          </button>
        </div>

        {/* Navigation tabs body */}
        <div className="mt-8 text-sm leading-relaxed text-charcoal/80">
          {activeTab === 'desc' && (
            <div className="space-y-4">
              <p>{product.description}</p>
              <p>
                Perfected by our master craftsmen at Shahpur Jat, this apparel reflects heirloom embroidery passed down through generations. Tailored with custom sizing fits and detailed seams to fit perfectly.
              </p>
            </div>
          )}
          {activeTab === 'specs' && (
            <ul className="space-y-3 list-disc pl-5">
              <li>
                <strong>Material:</strong> Pure organic Banarasi silk or plush velvet depends on categories.
              </li>
              <li>
                <strong>Embroidery:</strong> Genuine gold/silver gota-patti and thread zari details.
              </li>
              <li>
                <strong>Lining:</strong> 100% breathable organic cotton lining for comfort.
              </li>
              <li>
                <strong>Occasion:</strong> Festive collections, royal trousseau, weddings, high dinners.
              </li>
            </ul>
          )}
          {activeTab === 'care' && (
            <ul className="space-y-3 list-disc pl-5">
              <li>Dry clean only using mild organic solvents.</li>
              <li>Do not machine wash or squeeze the fabric.</li>
              <li>Iron on reverse side using low temperature settings.</li>
              <li>Store hanging in a dry dust cover away from direct sunlight.</li>
            </ul>
          )}
        </div>
      </div>

      {/* 3. Review Ratings Section */}
      <div className="space-y-6">
        <h3 className="font-serif text-xl font-bold text-charcoal border-b border-gold-primary/10 pb-3">
          Maison Reviews
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Average rating box */}
          <div className="md:col-span-4 bg-white border border-gold-primary/10 rounded-xl p-6 text-center space-y-2 shadow-sm">
            <h4 className="font-serif text-5xl font-extrabold text-emerald-primary">4.9</h4>
            <div className="flex justify-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-charcoal/60 font-semibold uppercase tracking-wider">Maison Average Score</p>
          </div>

          {/* User ratings list */}
          <div className="md:col-span-8 space-y-4">
            <div className="p-5 bg-white border border-gold-primary/10 rounded-xl shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-serif text-sm font-semibold text-charcoal">Anjali R.</span>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-charcoal/50 font-bold uppercase tracking-wider">Delhi B2B Retailer</p>
              <p className="text-xs text-charcoal/80 leading-relaxed">
                &ldquo;The emerald green kurta is stunning. The silk has an incredible sheen and the gold zari is very elegant. Fits perfectly based on size M.&rdquo;
              </p>
            </div>
            <div className="p-5 bg-white border border-gold-primary/10 rounded-xl shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-serif text-sm font-semibold text-charcoal">Meera V.</span>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-charcoal/50 font-bold uppercase tracking-wider">Mumbai Customer</p>
              <p className="text-xs text-charcoal/80 leading-relaxed">
                &ldquo;Beautiful flare on the mustard Anarkali. High quality georgette. Worth every rupee.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sizing Guide Modal Popup */}
      <AnimatePresence>
        {isSizeGuideOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSizeGuideOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-[500px] bg-alabaster border border-gold-primary/20 rounded-xl p-6 shadow-2xl z-50 space-y-5"
            >
              <div className="flex justify-between items-center border-b border-gold-primary/10 pb-3">
                <h3 className="font-serif text-lg font-bold text-emerald-primary flex items-center gap-1.5">
                  <Ruler className="w-5 h-5" /> Indian Kurta Sizing Chart
                </h3>
                <button
                  onClick={() => setIsSizeGuideOpen(false)}
                  className="px-2 py-1 text-xs text-charcoal/40 hover:text-charcoal font-bold uppercase tracking-wider"
                >
                  Close
                </button>
              </div>

              {/* Measurement Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-gold-primary/10 rounded">
                  <thead>
                    <tr className="bg-emerald-primary text-white text-[10px] uppercase font-bold tracking-wider">
                      <th className="p-3">Size</th>
                      <th className="p-3">Bust (in)</th>
                      <th className="p-3">Waist (in)</th>
                      <th className="p-3">Hips (in)</th>
                      <th className="p-3">Shoulders (in)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-primary/10 bg-white text-charcoal/80">
                    <tr>
                      <td className="p-3 font-bold bg-alabaster">S</td>
                      <td className="p-3">36</td>
                      <td className="p-3">32</td>
                      <td className="p-3">39</td>
                      <td className="p-3">14.0</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold bg-alabaster">M</td>
                      <td className="p-3">38</td>
                      <td className="p-3">34</td>
                      <td className="p-3">41</td>
                      <td className="p-3">14.5</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold bg-alabaster">L</td>
                      <td className="p-3">40</td>
                      <td className="p-3">36</td>
                      <td className="p-3">43</td>
                      <td className="p-3">15.0</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold bg-alabaster">XL</td>
                      <td className="p-3">42</td>
                      <td className="p-3">38</td>
                      <td className="p-3">45</td>
                      <td className="p-3">15.5</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold bg-alabaster">XXL</td>
                      <td className="p-3">44</td>
                      <td className="p-3">40</td>
                      <td className="p-3">47</td>
                      <td className="p-3">16.0</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="text-[10px] text-charcoal/50 font-medium italic mt-2 text-center">
                Note: Measurements refer to body sizing. If between sizes, we recommend ordering one size larger for alterations.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
