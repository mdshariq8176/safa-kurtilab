// Safa Kurtilab Automated Payment Webhook API
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bookShiprocketPickup } from '@/lib/shiprocket';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, orderId } = body;

    // Webhook validation
    if (!orderId) {
      return NextResponse.json({ error: 'Missing target Order ID reference.' }, { status: 400 });
    }

    console.log(`[Payment Webhook] Triggered event: ${event || 'payment.captured'} for Order ID: ${orderId}`);

    // 1. Fetch the target order from the database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json({ error: `Order with ID ${orderId} not found in database.` }, { status: 404 });
    }

    // Parse the ordered items snapshot
    const orderedItems = JSON.parse(order.items);

    // 2. Implement Indian GST Rules
    // Origin warehouse is West Bengal (WB)
    const normalizedState = (order.state || '').trim().toLowerCase();
    const isIntraState = normalizedState === 'west bengal' || normalizedState === 'wb' || normalizedState === 'w.b.';

    const baseAmount = order.totalAmount;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isIntraState) {
      // Intra-state: Split 5% GST into 2.5% CGST + 2.5% SGST
      cgst = baseAmount * 0.025;
      sgst = baseAmount * 0.025;
    } else {
      // Inter-state: Full 5% IGST
      igst = baseAmount * 0.05;
    }

    // Process items to include the garment HSN code '6208'
    const itemsWithHSN = orderedItems.map((item: { title: string; price: number; quantity: number; size: string; color: string }) => ({
      ...item,
      hsnCode: '6208', // Garments & Accessories HSN code
    }));

    const invoiceDataPayload = {
      baseAmount: Math.round(baseAmount * 100) / 100,
      gstRate: '5%',
      cgst: Math.round(cgst * 100) / 100,
      sgst: Math.round(sgst * 100) / 100,
      igst: Math.round(igst * 100) / 100,
      totalTax: Math.round((cgst + sgst + igst) * 100) / 100,
      grandTotal: Math.round((baseAmount + cgst + sgst + igst) * 100) / 100,
      hsnCodeDefault: '6208',
      items: itemsWithHSN,
    };

    // 3. Trigger 3PL Logistics Automation (Shiprocket API helper)
    const customerDetails = {
      name: order.user.name || 'Safa Client',
      email: order.user.email,
      phone: order.phone || '9876543210',
      address: order.address || 'Street details not specified',
      city: order.city || 'City not specified',
      state: order.state || 'State not specified',
      pincode: order.pincode || '110001',
    };

    const shippingResponse = await bookShiprocketPickup(
      order.id,
      customerDetails,
      itemsWithHSN
    );

    // 4. Update the database order with tracking numbers, status changes, and invoice breakdown
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PAID',
        deliveryStatus: 'SHIPPED', // Auto-scheduled courier pickup sets it to SHIPPED
        trackingId: shippingResponse.trackingId,
        invoiceData: JSON.stringify({
          ...invoiceDataPayload,
          courier: shippingResponse.courierName,
          labelUrl: shippingResponse.labelUrl,
          manifestUrl: shippingResponse.manifestUrl,
          estimatedDelivery: shippingResponse.estimatedDelivery,
        }),
      },
    });

    // 5. WhatsApp & Vendor Alerts stubs
    console.log(`[Notification Engine] Dispatched B2B Invoice PDF via WhatsApp Business API (Interakt) to: ${customerDetails.phone}`);
    console.log(`[Vendor Notification] Routed order dispatch details directly to Wholesaler (Udaan/IndiaMart integration) for fulfillment.`);

    return NextResponse.json({
      success: true,
      message: 'Automated invoice generated and courier pick-up scheduled.',
      orderId: updatedOrder.id,
      trackingId: updatedOrder.trackingId,
      invoice: invoiceDataPayload,
      shipping: {
        courier: shippingResponse.courierName,
        label: shippingResponse.labelUrl,
        manifest: shippingResponse.manifestUrl,
        estimatedDelivery: shippingResponse.estimatedDelivery,
      },
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Webhook processing error:', error);
    const errMessage = error instanceof Error ? error.message : 'Internal database/logistics failure';
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
