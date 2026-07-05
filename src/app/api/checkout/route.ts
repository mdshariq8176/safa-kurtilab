// Safa Kurtilab Checkout Database API
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, totalAmount, gstAmount, gstin, companyName, email, phone, address, city, state, pincode } = body;

    if (!items || items.length === 0 || !totalAmount) {
      return NextResponse.json({ error: 'Missing invoice fields.' }, { status: 400 });
    }

    // 1. Fetch user by email or fallback to first user in database
    let user = await prisma.user.findFirst({
      where: { email: email || 'b2b@retailer.com' },
    });

    if (!user) {
      // Fallback create standard account if not found
      user = await prisma.user.create({
        data: {
          name: email ? email.split('@')[0] : 'Guest Client',
          email: email || `guest-${Date.now()}@safakurtilab.com`,
          password: 'guest_password_123',
          role: 'USER',
        },
      });
    }

    // 2. Commit Order transaction to SQLite/Postgres
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        items: JSON.stringify(items),
        totalAmount: parseFloat(totalAmount),
        gstAmount: parseFloat(gstAmount),
        gstin: gstin || null,
        companyName: companyName || null,
        paymentStatus: 'PAID',
        deliveryStatus: 'PROCESSING',
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
      },
    });

    // 3. Deduct variant stock in strict real-time
    for (const item of items) {
      const dbProduct = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });

      if (dbProduct) {
        // Find matching variant (same size & color)
        const matchingVariant = dbProduct.variants.find(
          (v) => v.size === item.size && v.color === item.color
        );

        if (matchingVariant) {
          const newStock = Math.max(0, matchingVariant.stock - item.quantity);
          await prisma.variant.update({
            where: { id: matchingVariant.id },
            data: { stock: newStock },
          });
        }
      }
    }

    return NextResponse.json({ orderId: order.id, success: true }, { status: 201 });
  } catch (error: unknown) {
    console.error('Checkout API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal database write failure';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
