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
  // 1. Fetch B2B & Individual orders list
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // 2. Fetch all products and size/color stock variants
  const products = await prisma.product.findMany({
    include: {
      variants: true,
    },
  });

  // 3. Count standard B2B registered users
  const usersCount = await prisma.user.count({
    where: {
      role: 'USER',
    },
  });

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
