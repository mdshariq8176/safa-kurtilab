// Safa Kurtilab Dynamic Product Details Page (Server Component)
import { prisma } from '@/lib/prisma';
import ProductDetailsClient from '@/components/shop/ProductDetailsClient';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { cache } from 'react';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Dedupes database queries for the same request lifecycle (generateMetadata + ProductPage)
const getProduct = cache(async (slug: string) => {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      variants: true,
    },
  });
});

export const revalidate = 30; // Cache pages on CDN, revalidate in background every 30s for real-time stock
export const dynamicParams = true; // Dynamically build other products on demand

// Generates dynamic page SEO metadata based on the current product
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Design Not Found | Safa Kurtilab',
    };
  }

  return {
    title: `${product.title} | Safa Kurtilab Luxury Wear`,
    description: product.description.substring(0, 160),
  };
}

// Pre-render the 50 most popular/recent designs to make catalog transition instant
export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      select: { slug: true },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    return products.map((product) => ({
      slug: product.slug,
    }));
  } catch (error) {
    console.error('generateStaticParams failed, fallback to empty array:', error);
    return [];
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ProductDetailsClient product={product} />
    </div>
  );
}
