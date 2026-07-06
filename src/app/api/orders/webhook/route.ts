// src/app/api/orders/webhook/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface WebhookItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

/**
 * Handles incoming webhook callbacks from Delhivery / Shiprocket logistics APIs.
 * Automatically updates order delivery states, triggers inventory re-adjustments,
 * and emails updates via Resend API.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing webhook routing parameters (orderId or status).' }, { status: 400 });
    }

    console.log(`[Logistics Webhook] Received status callback: "${status}" for Order ID: ${orderId}`);

    // 1. Fetch order details from database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json({ error: `Order with ID "${orderId}" not found.` }, { status: 404 });
    }

    const currentStatus = (order.deliveryStatus || '').toLowerCase();
    const targetStatus = status.trim().toLowerCase();

    // Map logistics status to internal statuses
    let newDeliveryStatus = order.deliveryStatus;
    let paymentStatusUpdate = order.paymentStatus;
    let triggerStockRestore = false;

    if (targetStatus === 'shipped' || targetStatus === 'in_transit') {
      newDeliveryStatus = 'SHIPPED';
    } else if (targetStatus === 'delivered') {
      newDeliveryStatus = 'DELIVERED';
      paymentStatusUpdate = 'PAID'; // Automatically marks as PAID upon delivery if cash-on-delivery
    } else if (targetStatus === 'returned' || targetStatus === 'rto') {
      newDeliveryStatus = 'RETURNED';
      // Only trigger inventory restore if the order wasn't already marked as RETURNED to avoid duplication
      if (currentStatus !== 'returned') {
        triggerStockRestore = true;
      }
    } else if (targetStatus === 'canceled' || targetStatus === 'cancelled') {
      newDeliveryStatus = 'CANCELLED';
      if (currentStatus !== 'cancelled' && currentStatus !== 'returned') {
        triggerStockRestore = true;
      }
    }

    // 2. Perform database transaction to update order state
    await prisma.order.update({
      where: { id: order.id },
      data: {
        deliveryStatus: newDeliveryStatus,
        paymentStatus: paymentStatusUpdate,
      },
    });

    // 3. Inventory Reverse Synchronization: Restore stock counts if returned/cancelled
    if (triggerStockRestore) {
      console.log(`[Logistics Webhook] Order is ${newDeliveryStatus}. Re-adding items back to inventory...`);
      const items: WebhookItem[] = JSON.parse(order.items);

      await prisma.$transaction(async (tx) => {
        for (const item of items) {
          const dbProduct = await tx.product.findUnique({
            where: { id: item.id },
            include: { variants: true },
          });

          if (dbProduct) {
            const matchingVariant = dbProduct.variants.find(
              (v) => v.size === item.size && v.color === item.color
            );

            if (matchingVariant) {
              const newStock = matchingVariant.stock + item.quantity;
              await tx.variant.update({
                where: { id: matchingVariant.id },
                data: { stock: newStock },
              });
              console.log(`  └─ Restored ${item.title} (${item.size}/${item.color}): Stock ${matchingVariant.stock} -> ${newStock}`);
            }
          }
        }
      });
    }

    // 4. Asynchronous email notification dispatch via Resend Free API
    const resendApiKey = process.env.RESEND_API_KEY;
    const isMockEmail = !resendApiKey || resendApiKey.startsWith('re_mock');
    const customerEmail = order.user.email;

    const emailSubject = `Maison Safa: Order #${order.id} is now ${newDeliveryStatus}`;
    const emailHtml = `
      <div style="font-family: 'Playfair Display', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fbfbf9; border: 1px solid #d4af37; color: #111827;">
        <h2 style="color: #044a34; text-align: center; border-b: 1px solid #d4af37; padding-bottom: 10px;">MAISON SAFA</h2>
        <p>Dear ${order.user.name || 'Client'},</p>
        <p>We are writing to update you on your luxury ensemble order status. Your order <strong>#${order.id}</strong> has been updated by our logistics partner.</p>
        <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #044a34; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #044a34;">Current Status: ${newDeliveryStatus}</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">Logistics Partner Update: ${status}</p>
        </div>
        <p>Our Delhivery/Shiprocket dispatch units have processed this transition. Invoices are dynamically updated inside your Customer Admin Command Center panel.</p>
        <p style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 30px; border-t: 1px solid #e5e7eb; padding-top: 15px;">
          Safa Design Studio, Shahpur Jat, New Delhi, 110049
        </p>
      </div>
    `;

    if (isMockEmail) {
      console.log(`[Offline Simulation] Dispatched Resend Email Notification successfully!`);
      console.log(`  |-- To: ${customerEmail}`);
      console.log(`  |-- Subject: ${emailSubject}`);
      console.log(`  |-- Body: [HTML Content Wrote]`);
    } else {
      // Trigger actual Resend API invocation asynchronously (fire-and-forget, don't wait for response to speed up webhook)
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Maison Safa <onboarding@resend.dev>', // Resend free tier sends from onboarding@resend.dev
          to: customerEmail,
          subject: emailSubject,
          html: emailHtml,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errBody = await res.text();
            console.error('[Resend Error] Email delivery failed:', errBody);
          } else {
            console.log(`[Resend Success] Notification dispatch completed to ${customerEmail}`);
          }
        })
        .catch((err) => {
          console.error('[Resend Exception] Failed calling email api:', err);
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Logistics status update processed successfully.',
      orderId: order.id,
      deliveryStatus: newDeliveryStatus,
      paymentStatus: paymentStatusUpdate,
      inventoryRestored: triggerStockRestore,
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Logistics webhook routing exception:', error);
    const msg = error instanceof Error ? error.message : 'Internal Logistics Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
