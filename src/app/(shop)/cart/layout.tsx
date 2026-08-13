import { Suspense } from 'react';
import CartPage from './page';

export default function CartLayout() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 animate-pulse">
          <div className="h-9 w-56 bg-gold-primary/10 rounded mb-2" />
          <div className="h-4 w-32 bg-gold-primary/10 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 bg-white rounded-xl border border-gold-primary/10 p-4 shadow-sm animate-pulse">
                <div className="w-20 h-24 bg-gold-primary/10 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gold-primary/10 rounded w-3/4" />
                  <div className="h-3 bg-gold-primary/10 rounded w-1/2" />
                  <div className="h-8 bg-gold-primary/10 rounded w-24 mt-3" />
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gold-primary/15 p-6 shadow-sm space-y-4 animate-pulse">
              <div className="h-6 bg-gold-primary/10 rounded w-40 mb-4" />
              <div className="h-4 bg-gold-primary/10 rounded" />
              <div className="h-4 bg-gold-primary/10 rounded" />
              <div className="h-4 bg-gold-primary/10 rounded" />
              <div className="h-12 bg-emerald-primary/20 rounded mt-6" />
            </div>
          </div>
        </div>
      </div>
    }>
      <CartPage />
    </Suspense>
  );
}
