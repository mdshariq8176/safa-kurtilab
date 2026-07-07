import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({});
    let updateCount = 0;

    for (const product of products) {
      if (
        product.title.includes('Chavi') ||
        product.title.includes('Chhabi') ||
        product.description.includes('Chavi') ||
        product.description.includes('Chhabi')
      ) {
        const newTitle = product.title
          .replace(/Chavi Creations/g, 'Safa Couture')
          .replace(/Chavi/g, 'Safa')
          .replace(/Chhabi/g, 'Safa');
        const newDescription = product.description
          .replace(/Chavi Creations/g, 'Safa Couture')
          .replace(/Chavi/g, 'Safa')
          .replace(/Chhabi/g, 'Safa')
          .replace(/Chavi_Creations/g, 'Safa_Couture');

        const baseSlug = newTitle
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');
        const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
        const newSlug = `${baseSlug}-${uniqueSuffix}`;

        await prisma.product.update({
          where: { id: product.id },
          data: {
            title: newTitle,
            description: newDescription,
            slug: newSlug,
          },
        });
        updateCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updateCount} products in the database successfully.`,
      updatedCount: updateCount,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown database renaming error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
