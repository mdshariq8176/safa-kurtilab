// Safa Kurtilab Admin Command Center Page (Server Component)
import { prisma } from '@/lib/prisma';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Maison Admin Command Center | Safa Kurtilab',
  description: 'Enterprise inventory control, sales metrics visualizations, and B2B client transaction histories.',
};

export const revalidate = 0; // Fetch fresh live orders and inventory alerts on each reload

export default async function AdminPage() {
  // Run all queries in parallel for speed
  const [orders, products, usersCount] = await Promise.all([
    // 1. Recent orders (last 50 only)
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    // 2. Latest 100 products only (was loading all 1700+ causing 9s load)
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        variants: true,
      },
    }),
    // 3. Count B2B registered users
    prisma.user.count({
      where: { role: 'USER' },
    }),
  ]);

  return (
    <div className="bg-alabaster">
      <AdminDashboardClient
        orders={orders}
        products={products}
        usersCount={usersCount}
      />
    </div>
  );
}
