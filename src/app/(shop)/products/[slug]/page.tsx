// Safa Kurtilab Dynamic Product Details Page (Server Component)
import { prisma } from '@/lib/prisma';
import ProductDetailsClient from '@/components/shop/ProductDetailsClient';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Fetches fresh stock counts on load

// Generates dynamic page SEO metadata based on the current product
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
  });

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

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // Retrieve single product with size/color variants
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      variants: true,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ProductDetailsClient product={product} />
    </div>
  );
}
