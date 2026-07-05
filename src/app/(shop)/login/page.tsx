'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, Mail, Phone, Lock, Sparkles, LogOut, ArrowRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Session } from '@supabase/supabase-js';

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Auth State
  const [session, setSession] = useState<Session | null>(null);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [inputVal, setInputVal] = useState('');
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [otpCode, setOtpCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Check session on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Request OTP trigger
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal) return;

    setErrorMessage('');
    setStatusMessage('');

    startTransition(async () => {
      try {
        const payload = authMethod === 'email' ? { email: inputVal } : { phone: inputVal };
        const { error } = await supabase.auth.signInWithOtp(payload);

        if (error) {
          setErrorMessage(error.message);
        } else {
          setStatusMessage(`A 6-digit verification code has been dispatched to your ${authMethod === 'email' ? 'email address' : 'phone number'}.`);
          setOtpStep('verify');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Verification request failed.';
        setErrorMessage(msg);
      }
    });
  };

  // Submit/Verify OTP trigger
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) return;

    setErrorMessage('');

    startTransition(async () => {
      try {
        const { data, error } = authMethod === 'email'
          ? await supabase.auth.verifyOtp({ email: inputVal, token: otpCode, type: 'email' })
          : await supabase.auth.verifyOtp({ phone: inputVal, token: otpCode, type: 'sms' });

        if (error) {
          setErrorMessage(error.message);
        } else if (data.session) {
          setStatusMessage('Login authenticated successfully. Redirecting you to Maison Safa...');
          setTimeout(() => {
            router.push('/');
          }, 1500);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'OTP verification failed.';
        setErrorMessage(msg);
      }
    });
  };

  // Sign out trigger
  const handleSignOut = () => {
    startTransition(async () => {
      await supabase.auth.signOut();
      setOtpStep('request');
      setInputVal('');
      setOtpCode('');
      setStatusMessage('Signed out successfully.');
    });
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-[#fbfbf9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-gold-primary/10 rounded-2xl shadow-sm overflow-hidden p-8 space-y-8 relative">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-primary/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-primary/5 rounded-full blur-2xl" />

        <div className="text-center relative z-10 space-y-2">
          <Sparkles className="w-8 h-8 text-gold-primary mx-auto stroke-[1.25]" />
          <h1 className="font-serif text-3xl font-bold text-charcoal">Maison Safa Profile</h1>
          <p className="text-xs text-charcoal/50 uppercase tracking-widest font-semibold">
            {session ? 'Welcome Back' : 'Secure Passwordless Access'}
          </p>
          <div className="w-12 h-0.5 bg-gold-primary mx-auto mt-2" />
        </div>

        <AnimatePresence mode="wait">
          {session ? (
            /* User Panel (Already Authenticated) */
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 relative z-10 text-center"
            >
              <div className="p-5 bg-emerald-primary/5 border border-emerald-primary/15 rounded-xl space-y-4">
                <div className="w-16 h-16 bg-emerald-primary text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <User className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-charcoal">
                    {session.user.user_metadata?.name || 'Safa Client'}
                  </h3>
                  <p className="text-xs font-mono text-charcoal/60">
                    {session.user.email || session.user.phone}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => router.push('/')}
                  className="w-full py-3.5 bg-emerald-primary hover:bg-emerald-light text-white text-xs font-bold tracking-widest uppercase rounded shadow transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  Continue Shopping
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={handleSignOut}
                  disabled={isPending}
                  className="w-full py-3.5 border border-charcoal/10 hover:border-red-500 hover:text-red-500 text-charcoal text-xs font-bold tracking-widest uppercase rounded transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {isPending ? 'Logging Out...' : 'Sign Out'}
                </button>
              </div>
            </motion.div>
          ) : (
            /* Authentication Panel */
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 relative z-10"
            >
              {otpStep === 'request' ? (
                /* Stage 1: Request OTP Form */
                <form onSubmit={handleRequestOtp} className="space-y-5">
                  {/* Mode Toggles */}
                  <div className="grid grid-cols-2 p-1 bg-alabaster border border-gold-primary/10 rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('email');
                        setInputVal('');
                      }}
                      className={`py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                        authMethod === 'email'
                          ? 'bg-emerald-primary text-white shadow-sm'
                          : 'text-charcoal/40 hover:text-charcoal/60'
                      }`}
                    >
                      Email OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMethod('phone');
                        setInputVal('');
                      }}
                      className={`py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                        authMethod === 'phone'
                          ? 'bg-emerald-primary text-white shadow-sm'
                          : 'text-charcoal/40 hover:text-charcoal/60'
                      }`}
                    >
                      Phone OTP
                    </button>
                  </div>

                  {/* Input Label & Field */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gold-dark uppercase tracking-widest">
                      {authMethod === 'email' ? 'Email Address' : 'Mobile Number (with country code)'}
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-charcoal/30">
                        {authMethod === 'email' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                      </div>
                      <input
                        type={authMethod === 'email' ? 'email' : 'tel'}
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        placeholder={authMethod === 'email' ? 'name@company.com' : '+91 98765 43210'}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-alabaster border border-gold-primary/10 rounded-lg focus:outline-none focus:border-gold-primary text-sm"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3.5 bg-emerald-primary hover:bg-emerald-light disabled:bg-emerald-primary/60 text-white text-xs font-bold tracking-widest uppercase rounded shadow transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4.5 h-4.5" />
                    {isPending ? 'Requesting Code...' : 'Send Verification OTP'}
                  </button>
                </form>
              ) : (
                /* Stage 2: Verify OTP Form */
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gold-dark uppercase tracking-widest">
                      Enter 6-Digit Verification Code
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-charcoal/30">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-alabaster border border-gold-primary/10 rounded-lg focus:outline-none focus:border-gold-primary text-sm font-mono tracking-[0.25em] text-center font-bold text-charcoal"
                      />
                    </div>
                    {statusMessage && (
                      <p className="text-[11px] text-emerald-light leading-relaxed font-medium mt-1">
                        {statusMessage}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={isPending || otpCode.length !== 6}
                      className="w-full py-3.5 bg-emerald-primary hover:bg-emerald-light disabled:bg-emerald-primary/60 text-white text-xs font-bold tracking-widest uppercase rounded shadow transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {isPending ? 'Verifying...' : 'Verify & Log In'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep('request');
                        setOtpCode('');
                      }}
                      className="w-full py-2.5 text-xs text-charcoal/40 hover:text-charcoal/60 font-semibold uppercase tracking-wider"
                    >
                      &larr; Back to Input
                    </button>
                  </div>
                </form>
              )}

              {/* Status Alert Panels */}
              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 font-medium">
                  {errorMessage}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
