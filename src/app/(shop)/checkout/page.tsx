'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { ShoppingBag, ShieldCheck, CreditCard, ChevronRight, CheckCircle, AlertTriangle, Sparkles, Building } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// Indian GSTIN regex validation formula
const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;

export default function CheckoutPage() {
  const { items, cartTotal, gstAmount, grandTotal, clearCart } = useCart();

  // Contact details form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isB2B: false,
    companyName: '',
    gstin: '',
  });

  // UI state
  const [gstinError, setGstinError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'modal' | 'success'>('form');
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [paidAmount, setPaidAmount] = useState(0);

  // Handle input inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => {
      const next = { ...prev, [name]: inputValue };

      // Immediate validation on GSTIN input
      if (name === 'gstin') {
        const uppercaseVal = value.toUpperCase();
        next.gstin = uppercaseVal;

        if (!value) {
          setGstinError('');
        } else if (!GSTIN_REGEX.test(uppercaseVal)) {
          setGstinError('Invalid GSTIN structure. Must match: 07AAAAA1111A1Z1');
        } else {
          setGstinError('');
        }
      }

      return next;
    });
  };

  const isFormValid = () => {
    const baseFields = formData.name && formData.email && formData.phone && formData.address && formData.city && formData.state && formData.pincode;
    if (!baseFields) return false;
    if (formData.isB2B) {
      return formData.companyName && formData.gstin && !gstinError;
    }
    return true;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;
    setPaymentStep('modal');
  };

  // Simulate remote transaction capture and write database records
  const handleSimulatePayment = async (status: 'SUCCESS' | 'FAIL') => {
    if (status === 'FAIL') {
      alert('Simulated transaction failed. Please review payment method or retry.');
      setPaymentStep('form');
      return;
    }

    setIsProcessing(true);

    try {
      // Send cart payload to our mock order creation API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.productId,
            title: item.title,
            price: item.price - item.price * (item.discount / 100),
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
          totalAmount: grandTotal,
          gstAmount: gstAmount,
          gstin: formData.isB2B ? formData.gstin : null,
          companyName: formData.isB2B ? formData.companyName : null,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Trigger automated payment webhook to run MTO logistics (Shiprocket) and Indian GST splitting
        try {
          await fetch('/api/webhooks/payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              event: 'payment.captured',
              orderId: data.orderId,
            }),
          });
        } catch (webhookError) {
          console.error('Failed to trigger background automation webhook:', webhookError);
        }

        setCreatedOrderId(data.orderId);
        setPaidAmount(grandTotal);
        setPaymentStep('success');
        clearCart();
      } else {
        alert('Failed to register order: ' + data.error);
        setPaymentStep('form');
      }
    } catch (error) {
      console.error(error);
      alert('Internal network error creating order.');
      setPaymentStep('form');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStep === 'success') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full text-green-600">
          <CheckCircle className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] text-gold-dark font-bold uppercase tracking-widest">Transaction Verified</span>
          <h1 className="font-serif text-3xl font-bold text-charcoal">Your Order is Sealed!</h1>
          <p className="text-sm text-charcoal/60 max-w-sm mx-auto">
            Maison Safa has registered your luxury ensemble. Our design artisans are preparing your order package.
          </p>
        </div>

        {/* Receipt specs */}
        <div className="bg-white border border-gold-primary/15 rounded-xl p-5 text-left text-xs text-charcoal space-y-3.5 shadow-sm">
          <div className="flex justify-between border-b border-gold-primary/5 pb-2">
            <span className="text-charcoal/50">Receipt Number</span>
            <span className="font-mono font-bold text-emerald-primary">{createdOrderId}</span>
          </div>
          {formData.isB2B && (
            <div className="space-y-1 bg-gold-primary/5 p-3 rounded border border-gold-primary/10">
              <div className="flex justify-between">
                <span className="text-charcoal/60 font-semibold">Registered Company</span>
                <span className="font-bold">{formData.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60 font-semibold">B2B GSTIN</span>
                <span className="font-mono font-bold">{formData.gstin}</span>
              </div>
              <p className="text-[10px] text-charcoal/40 mt-1 italic">
                * GST invoice copy will be emailed to {formData.email}.
              </p>
            </div>
          )}
          <div className="flex justify-between font-semibold pt-1">
            <span>Amount Logged (Tax Included)</span>
            <span className="text-sm font-bold text-emerald-primary">₹{paidAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/">
            <button className="px-6 py-2.5 bg-emerald-primary hover:bg-emerald-light text-white text-xs font-semibold tracking-wider uppercase rounded transition-colors shadow">
              Return Home
            </button>
          </Link>
          <Link href="/admin">
            <button className="px-6 py-2.5 border border-gold-primary/30 hover:border-gold-primary text-gold-dark hover:text-emerald-primary text-xs font-semibold tracking-wider uppercase rounded transition-colors">
              Manage Orders
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {items.length === 0 ? (
        <div className="max-w-md mx-auto text-center space-y-4 py-16 bg-white border border-gold-primary/10 p-8 rounded-xl shadow-sm">
          <ShoppingBag className="w-16 h-16 text-gold-primary/30 mx-auto stroke-[1.25]" />
          <h2 className="font-serif text-2xl font-bold text-charcoal">Your Bag is Empty</h2>
          <p className="text-sm text-charcoal/60">
            Add designs from our luxury boutique catalog before opening the checkout pipeline.
          </p>
          <Link href="/products">
            <button className="px-6 py-2.5 bg-emerald-primary text-white text-xs font-semibold tracking-wider uppercase rounded transition-colors">
              Browse Designs
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Checkout Info Form */}
          <div className="lg:col-span-7 bg-white border border-gold-primary/10 rounded-xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-gold-primary/10 pb-4">
              <CreditCard className="w-5.5 h-5.5 text-gold-primary" />
              <h2 className="font-serif text-xl font-bold text-charcoal">Maison Billing & Delivery</h2>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs text-charcoal">
              {/* Form columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal/70 uppercase">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 border border-gold-primary/20 rounded focus:outline-none focus:border-gold-primary bg-alabaster/50 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal/70 uppercase">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. name@company.com"
                    className="w-full px-3.5 py-2.5 border border-gold-primary/20 rounded focus:outline-none focus:border-gold-primary bg-alabaster/50 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-charcoal/70 uppercase">Contact Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-3.5 py-2.5 border border-gold-primary/20 rounded focus:outline-none focus:border-gold-primary bg-alabaster/50 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-charcoal/70 uppercase">Shipping Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Street details, apartment, suite number"
                  className="w-full px-3.5 py-2.5 border border-gold-primary/20 rounded focus:outline-none focus:border-gold-primary bg-alabaster/50 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal/70 uppercase">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="Delhi"
                    className="w-full px-3.5 py-2.5 border border-gold-primary/20 rounded focus:outline-none focus:border-gold-primary bg-alabaster/50 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal/70 uppercase">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    placeholder="Delhi"
                    className="w-full px-3.5 py-2.5 border border-gold-primary/20 rounded focus:outline-none focus:border-gold-primary bg-alabaster/50 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-charcoal/70 uppercase">Pin Code</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                    placeholder="110049"
                    className="w-full px-3.5 py-2.5 border border-gold-primary/20 rounded focus:outline-none focus:border-gold-primary bg-alabaster/50 text-sm"
                  />
                </div>
              </div>

              {/* B2B Sliding Checkbox Container */}
              <div className="pt-4 border-t border-gold-primary/10">
                <label className="flex items-center gap-2.5 cursor-pointer font-bold uppercase tracking-wider text-emerald-primary">
                  <input
                    type="checkbox"
                    name="isB2B"
                    checked={formData.isB2B}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded text-emerald-primary focus:ring-emerald-primary border-gold-primary/30"
                  />
                  <Building className="w-4 h-4" /> Buying for Business? (B2B Tax Save)
                </label>

                {/* Animated expand fields */}
                <AnimatePresence>
                  {formData.isB2B && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      className="overflow-hidden space-y-4 bg-gold-primary/5 p-4 rounded-lg border border-gold-primary/15"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="font-bold text-charcoal/70 uppercase">Registered Company Name</label>
                          <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            required={formData.isB2B}
                            placeholder="e.g. Chic Boutique India"
                            className="w-full px-3.5 py-2.5 border border-gold-primary/20 rounded focus:outline-none focus:border-gold-primary bg-white text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-charcoal/70 uppercase">B2B GSTIN Code</label>
                          <input
                            type="text"
                            name="gstin"
                            value={formData.gstin}
                            onChange={handleInputChange}
                            required={formData.isB2B}
                            placeholder="15-digit code e.g. 07AAAAA1111A1Z1"
                            className="w-full px-3.5 py-2.5 border border-gold-primary/20 rounded focus:outline-none focus:border-gold-primary bg-white text-sm"
                          />
                        </div>
                      </div>

                      {/* GSTIN Error message banner */}
                      {gstinError && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2 text-xs">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span>{gstinError}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={!isFormValid()}
                className={`w-full py-4 text-xs font-semibold tracking-widest uppercase transition-all rounded shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                  isFormValid()
                    ? 'bg-emerald-primary hover:bg-emerald-light text-white'
                    : 'bg-charcoal/10 text-charcoal/40 cursor-not-allowed border border-charcoal/5 shadow-none'
                }`}
              >
                Configure Payment <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Cart Invoice summary sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-gold-primary/10 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-serif text-lg font-bold text-charcoal border-b border-gold-primary/10 pb-3 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gold-primary" /> Invoice Summary
              </h3>

              {/* Cart List */}
              <div className="divide-y divide-gold-primary/10 max-h-[250px] overflow-y-auto pr-2 space-y-3.5 pb-2">
                {items.map((item) => {
                  const finalPrice = item.price - item.price * (item.discount / 100);
                  return (
                    <div key={item.id} className="flex gap-3.5 pt-3.5 first:pt-0">
                      <div className="relative w-12 h-16 bg-alabaster rounded overflow-hidden flex-shrink-0 border border-gold-primary/5">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-charcoal truncate">{item.title}</h4>
                        <div className="text-[10px] text-charcoal/50 mt-0.5">
                          Size: <strong>{item.size}</strong> | Color: <strong>{item.color}</strong>
                        </div>
                        <div className="text-[10px] text-charcoal/60 mt-1 font-semibold">
                          ₹{finalPrice.toLocaleString('en-IN')} x {item.quantity}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Invoicing Numbers */}
              <div className="border-t border-gold-primary/10 pt-4 text-xs text-charcoal space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-charcoal/60">Selected Ensemble Subtotal</span>
                  <span className="font-semibold">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal/60">Maison CGST + SGST (5%)</span>
                  <span className="font-semibold text-charcoal/80">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-px bg-gold-primary/10 my-2" />
                <div className="flex justify-between text-sm font-serif font-bold text-charcoal">
                  <span>Grand Total</span>
                  <span className="text-emerald-primary text-base">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Verification Security Badge */}
            <div className="p-4 bg-emerald-primary/5 border border-gold-primary/20 rounded-xl flex gap-3 text-xs text-charcoal/70">
              <ShieldCheck className="w-8 h-8 text-gold-primary flex-shrink-0" />
              <div className="space-y-0.5">
                <h4 className="font-bold text-emerald-primary uppercase tracking-wider text-[10px]">Secure Maison Node</h4>
                <p className="text-[10px] leading-relaxed text-charcoal/60">
                  Transactions are logged over TLS 1.3 encryption. B2B GST tax returns automatically logged under state guidelines.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. simulated Razorpay checkout window overlay */}
      <AnimatePresence>
        {paymentStep === 'modal' && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: '-40%', x: '-50%' }}
              animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
              exit={{ opacity: 0, scale: 0.95, y: '-40%', x: '-50%' }}
              transition={{ duration: 0.25 }}
              className="fixed top-1/2 left-1/2 w-11/12 max-w-[420px] bg-charcoal text-white rounded-xl shadow-2xl z-50 overflow-hidden border border-white/10"
            >
              {/* Header */}
              <div className="bg-[#182030] p-5 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#f3d065]" />
                  <span className="font-serif text-sm font-bold uppercase tracking-widest text-[#f3d065]">
                    Razorpay Gateway Simulator
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 text-center">
                <div className="space-y-1">
                  <span className="text-[10px] text-white/50 uppercase tracking-widest">Safa Kurtilab Payment Intent</span>
                  <h4 className="font-serif text-2xl font-bold text-white">₹{grandTotal.toLocaleString('en-IN')}</h4>
                  <p className="text-[11px] text-white/60">GST Registered Invoice ID: MOCK_RZP_INTENT_90812</p>
                </div>

                {isProcessing ? (
                  <div className="py-6 flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 border-4 border-[#f3d065] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-white/70">Broadcasting transaction to Maison servers...</span>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <p className="text-xs text-white/70 bg-white/5 p-3 rounded leading-relaxed">
                      This is a secure mock integration. Click below to simulate the Razorpay transaction capture response.
                    </p>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleSimulatePayment('SUCCESS')}
                        className="w-full py-3 bg-emerald-light hover:bg-green-600 text-white font-bold text-xs tracking-widest uppercase transition-colors rounded shadow-md"
                      >
                        Simulate Payment Success
                      </button>
                      <button
                        onClick={() => handleSimulatePayment('FAIL')}
                        className="w-full py-3 bg-red-900/60 hover:bg-red-700 text-white font-bold text-xs tracking-widest uppercase transition-colors rounded"
                      >
                        Simulate Payment Failure
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-[#182030] p-4 text-center border-t border-white/5 text-[9px] text-white/40 uppercase tracking-widest">
                Protected by Razorpay India Core Network
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
