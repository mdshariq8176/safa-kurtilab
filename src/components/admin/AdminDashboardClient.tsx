'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, ArrowLeft, TrendingUp, ShoppingBag, Users, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  totalAmount: number;
  gstAmount: number;
  gstin: string | null;
  companyName: string | null;
  paymentStatus: string;
  deliveryStatus: string;
  createdAt: Date;
}

interface Variant {
  id: string;
  size: string;
  color: string;
  stock: number;
}

interface Product {
  id: string;
  title: string;
  category: string;
  basePrice: number;
  variants: Variant[];
}

interface AdminDashboardClientProps {
  orders: Order[];
  products: Product[];
  usersCount: number;
}

export default function AdminDashboardClient({ orders, products, usersCount }: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders'>('overview');

  // 1. Calculate KPI Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;

  // Flatten products to get all variants and flag low stock
  const allVariants = products.flatMap((product) =>
    product.variants.map((v) => ({
      variantId: v.id,
      productTitle: product.title,
      category: product.category,
      price: product.basePrice,
      size: v.size,
      color: v.color,
      stock: v.stock,
    }))
  );

  const lowStockVariants = allVariants.filter((v) => v.stock < 5);
  const lowStockCount = lowStockVariants.length;

  // 2. Prepare Recharts Line Chart Data (group orders by date)
  const salesMap = new Map<string, number>();
  orders.forEach((order) => {
    // Format date as DD-Mon
    const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
    salesMap.set(dateStr, (salesMap.get(dateStr) || 0) + order.totalAmount);
  });

  const chartData = Array.from(salesMap.entries()).map(([date, revenue]) => ({
    date,
    Revenue: Math.round(revenue),
  }));

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gold-primary/10 pb-6 gap-4">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-charcoal/60 hover:text-emerald-primary uppercase tracking-wider font-semibold transition-colors mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
          </Link>
          <h1 className="font-serif text-3xl font-bold text-charcoal">Admin Command Center</h1>
        </div>

        {/* Dashboard Tabs Toggle */}
        <div className="flex bg-alabaster border border-gold-primary/10 rounded-lg p-1.5 gap-2 text-xs font-bold uppercase tracking-wider text-charcoal">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'overview' ? 'bg-emerald-primary text-white shadow-sm' : 'hover:bg-gold-primary/10'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'inventory' ? 'bg-emerald-primary text-white shadow-sm' : 'hover:bg-gold-primary/10'
            }`}
          >
            Inventory Grid {lowStockCount > 0 && <span className="bg-red-600 text-white rounded-full px-1.5 py-0.5 text-[10px]">{lowStockCount}</span>}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'orders' ? 'bg-emerald-primary text-white shadow-sm' : 'hover:bg-gold-primary/10'
            }`}
          >
            B2B Orders
          </button>
        </div>
      </div>

      {/* 2. Stats cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-white border border-gold-primary/10 p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-primary/5 rounded-full text-emerald-primary">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-charcoal/50 uppercase font-bold tracking-wider">Gross Sales</span>
            <h4 className="text-xl font-bold text-charcoal">₹{totalRevenue.toLocaleString('en-IN')}</h4>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white border border-gold-primary/10 p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-primary/5 rounded-full text-emerald-primary">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-charcoal/50 uppercase font-bold tracking-wider">Total Orders</span>
            <h4 className="text-xl font-bold text-charcoal">{totalOrders} Orders</h4>
          </div>
        </div>

        {/* Users */}
        <div className="bg-white border border-gold-primary/10 p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-primary/5 rounded-full text-emerald-primary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-charcoal/50 uppercase font-bold tracking-wider">B2B Clients</span>
            <h4 className="text-xl font-bold text-charcoal">{usersCount} Clients</h4>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white border border-gold-primary/10 p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-full ${lowStockCount > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-charcoal/50 uppercase font-bold tracking-wider">Inventory Alerts</span>
            <h4 className={`text-xl font-bold ${lowStockCount > 0 ? 'text-red-600' : 'text-green-700'}`}>
              {lowStockCount} Warnings
            </h4>
          </div>
        </div>
      </div>

      {/* 3. Tab contents views */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chart Panel */}
          <div className="lg:col-span-8 bg-white border border-gold-primary/10 p-6 rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gold-primary/5 pb-4">
              <h3 className="font-serif text-lg font-bold text-charcoal">Sales Velocity</h3>
              <span className="text-[10px] text-emerald-primary font-bold uppercase tracking-widest bg-emerald-primary/5 px-2.5 py-1 rounded">
                Live Transaction Node
              </span>
            </div>
            <div className="h-[300px] w-full">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-charcoal/40 font-semibold">
                  No transaction velocity logged yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#044a34" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#044a34" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} />
                    <YAxis stroke="#9ca3af" fontSize={10} />
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Area type="monotone" dataKey="Revenue" stroke="#044a34" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Critical Alerts sidebar shortcut */}
          <div className="lg:col-span-4 bg-white border border-gold-primary/10 p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-charcoal border-b border-gold-primary/5 pb-4 flex items-center gap-1.5 text-red-600">
              <AlertCircle className="w-5 h-5" /> Urgent Restocks
            </h3>
            <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-2">
              {lowStockVariants.length === 0 ? (
                <p className="text-xs text-green-700 font-semibold bg-green-50 p-4 rounded text-center">
                  All size/color variants satisfy the safety stock threshold.
                </p>
              ) : (
                lowStockVariants.map((item) => (
                  <div key={item.variantId} className="flex justify-between items-center p-3 bg-red-50/60 border border-red-100 rounded text-xs">
                    <div className="space-y-0.5">
                      <h4 className="font-semibold text-charcoal line-clamp-1">{item.productTitle}</h4>
                      <p className="text-[10px] text-charcoal/50 font-bold uppercase">
                        Size: {item.size} | Color: {item.color}
                      </p>
                    </div>
                    <span className="font-bold text-red-600 bg-red-100/60 px-2 py-1 rounded">
                      {item.stock} Left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="bg-white border border-gold-primary/10 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gold-primary/10">
            <h3 className="font-serif text-lg font-bold text-charcoal">Strict Inventory Control Grid</h3>
            <p className="text-xs text-charcoal/60 mt-0.5">Flagged in red when stock falls below 5 items threshold.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-charcoal">
              <thead>
                <tr className="bg-emerald-primary text-white text-[10px] uppercase font-bold tracking-wider">
                  <th className="p-4">Design Item</th>
                  <th className="p-4">Silhouette</th>
                  <th className="p-4">Colorway</th>
                  <th className="p-4 text-center">Size</th>
                  <th className="p-4 text-center">Base Price</th>
                  <th className="p-4 text-center">Stock Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-primary/10 bg-white">
                {allVariants.map((item) => {
                  const isLow = item.stock < 5;
                  return (
                    <tr key={item.variantId} className="hover:bg-alabaster/50 transition-colors">
                      <td className="p-4 font-semibold text-charcoal">{item.productTitle}</td>
                      <td className="p-4 text-charcoal/60 font-semibold">{item.category}</td>
                      <td className="p-4 text-charcoal/60 font-semibold">{item.color}</td>
                      <td className="p-4 text-center font-bold">{item.size}</td>
                      <td className="p-4 text-center font-semibold">₹{item.price.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded font-bold ${
                          isLow ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700'
                        }`}>
                          {item.stock} Unit{item.stock !== 1 && 's'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white border border-gold-primary/10 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gold-primary/10">
            <h3 className="font-serif text-lg font-bold text-charcoal">B2B Corporate Billing History</h3>
            <p className="text-xs text-charcoal/60 mt-0.5">Logs and automated GSTIN tax logging records.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-charcoal">
              <thead>
                <tr className="bg-emerald-primary text-white text-[10px] uppercase font-bold tracking-wider">
                  <th className="p-4">Receipt ID</th>
                  <th className="p-4">Client Type</th>
                  <th className="p-4">Company Details</th>
                  <th className="p-4 text-center">Grand Total</th>
                  <th className="p-4 text-center">GST Logged (5%)</th>
                  <th className="p-4 text-center">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-primary/10 bg-white">
                {orders.map((order) => {
                  const isB2B = !!order.gstin;
                  return (
                    <tr key={order.id} className="hover:bg-alabaster/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-emerald-primary">{order.id}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isB2B ? 'bg-gold-primary/10 text-gold-dark border border-gold-primary/20' : 'bg-charcoal/5 text-charcoal/60'
                        }`}>
                          {isB2B ? 'B2B Client' : 'Individual'}
                        </span>
                      </td>
                      <td className="p-4 space-y-0.5">
                        {isB2B ? (
                          <>
                            <div className="font-bold text-charcoal">{order.companyName}</div>
                            <div className="text-[10px] text-charcoal/50 font-mono">GSTIN: {order.gstin}</div>
                          </>
                        ) : (
                          <span className="text-charcoal/40 italic">Retail Purchase</span>
                        )}
                      </td>
                      <td className="p-4 text-center font-bold text-emerald-primary">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-center font-semibold text-charcoal/60">₹{order.gstAmount.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                          order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
