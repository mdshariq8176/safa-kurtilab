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
 * Delhivery B2B white-label logistics helper.
 * Overwrites Sender/Origin details with Chennai Office, maps Pickup/Warehouse to product supplier address,
 * and dynamically sets the RTO destination back to the factory node on returns.
 */
function generateDelhiveryB2BLabel(
  order: {
    trackingId?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    user?: { name?: string | null } | null;
  },
  manufacturerAddress: string,
  isRTO: boolean
) {
  const pickupLocation = manufacturerAddress || 'Jaipur Textile Factory, Plot 14, Industrial Area, Jaipur, Rajasthan, 302001';
  const rtoAddress = isRTO ? pickupLocation : 'Safa Kurtilab, Vill-Hareknagar Mollabari, P.O. Hareknagar, P.S. Beldanga, District: Murshidabad, West Bengal - 742133';

  return `
    <div style="font-family: Arial, sans-serif; width: 400px; border: 2px dashed #000; padding: 15px; margin: 10px auto; background-color: #fff; color: #000; font-size: 11px; line-height: 1.4;">
      <div style="text-align: center; font-weight: bold; font-size: 14px; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px;">
        DELHIVERY B2B SHIPPING LABEL ${isRTO ? '(RTO REDIRECTED)' : ''}
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <div>
          <strong>Sender/Origin:</strong><br/>
          Safa Kurtilab<br/>
          Vill-Hareknagar Mollabari, P.O. Hareknagar,<br/>
          P.S. Beldanga, Dist: Murshidabad,<br/>
          West Bengal - 742133
        </div>
        <div style="text-align: right;">
          <strong>Pickup/Warehouse Location:</strong><br/>
          ${pickupLocation}
        </div>
      </div>
      <div style="border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 5px 0; margin: 5px 0; font-weight: bold;">
        Tracking ID / AWB: ${order.trackingId || 'DELHIVERY_MOCK_AWB_9921827'}
      </div>
      <div>
        <strong>Ship To (Destination):</strong><br/>
        ${order.user?.name || 'Client'}<br/>
        ${order.address || 'Address N/A'}, ${order.city || ''}, ${order.state || ''} - ${order.pincode || ''}
      </div>
      <div style="margin-top: 8px; padding-top: 5px; border-top: 1px dashed #ccc;">
        <strong>Return-To-Origin (RTO) Path:</strong><br/>
        ${rtoAddress}
      </div>
      <div style="margin-top: 10px; font-size: 9px; color: #555; text-align: center; border-top: 1px solid #eee; padding-top: 5px;">
        Delhivery White-Label B2B Logistics Routing Core v2.0
      </div>
    </div>
  `;
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

    // Extract items to parse manufacturer/factory coordinates
    const items: WebhookItem[] = JSON.parse(order.items);
    let manufacturerAddress = 'Safa Design Studio Warehouse, Shahpur Jat, New Delhi, 110049';
    
    if (items.length > 0) {
      const dbProduct = await prisma.product.findUnique({
        where: { id: items[0].id },
      });
      if (dbProduct) {
        // Extract original vendor from description (e.g. "Listed under vendor Chavi_Creations.")
        const vendorMatch = dbProduct.description.match(/Listed under vendor ([\w\s_-]+?)\./);
        const originalVendor = vendorMatch ? vendorMatch[1].trim() : 'Safa_Couture';
        const category = (dbProduct.category || '').toLowerCase();

        console.log(`[Logistics Webhook] Routing order for product vendor: "${originalVendor}" and category: "${category}"`);

        if (originalVendor === 'Chavi_Creations') {
          if (category.includes('cotton') || category.includes('pant')) {
            manufacturerAddress = 'Chavi Creations Cotton Hub, Plot 110, Sanganer Industrial Area, Jaipur, Rajasthan, 302029';
          } else {
            manufacturerAddress = 'Chavi Creations Main Warehouse, Malviya Nagar, Jaipur, Rajasthan, 302017';
          }
        } else if (originalVendor === 'Maaesa_Creations') {
          if (category.includes('plazo') || category.includes('festive')) {
            manufacturerAddress = 'Maaesa Creations Festive Unit, Phase 3, Surat GIDC, Gujarat, 395003';
          } else {
            manufacturerAddress = 'Maaesa Creations Jaipur Block, Sitapura Industrial Area, Jaipur, Rajasthan, 302022';
          }
        } else if (originalVendor === 'Jaipur_Ethnic' || originalVendor === 'Jaipur Ethnic') {
          manufacturerAddress = 'JAIPUR ETHNIC, DUSHYANTT BHALLA, 2nd Floor, 4/164 SFS, Above Tirupati Textiles, Mansarovar Industrial Area, Jaipur, Rajasthan, 302020';
        } else {
          // Fallback to default Safa Couture warehouses
          if (category === 'anarkali') {
            manufacturerAddress = 'Safa Surat Weaving Unit, Phase 2, Surat, Gujarat, 395003';
          } else if (category === 'straight cut') {
            manufacturerAddress = 'Safa Jaipur Textile Factory, Plot 14, Industrial Area, Jaipur, Rajasthan, 302001';
          } else {
            manufacturerAddress = 'Safa Design Studio Warehouse, Shahpur Jat, New Delhi, 110049';
          }
        }
      }
    }

    // Ingest invoiceData details with the white-labeled print layout and RTO path redirects
    let invoiceJson: { printableLabel?: string; rtoRoutingPath?: string; [key: string]: unknown } = {};
    if (order.invoiceData) {
      try {
        invoiceJson = JSON.parse(order.invoiceData) as Record<string, unknown>;
      } catch {
        invoiceJson = {};
      }
    }

    const isRTO = newDeliveryStatus === 'RETURNED';
    invoiceJson.printableLabel = generateDelhiveryB2BLabel(order, manufacturerAddress, isRTO);
    if (isRTO) {
      invoiceJson.rtoRoutingPath = `RTO Cargo Redirected to Supplier: ${manufacturerAddress}`;
      console.log(`[Logistics Webhook] RTO assigned to supplier factory node: ${manufacturerAddress}`);
    }

    // 2. Perform database transaction to update order state
    await prisma.order.update({
      where: { id: order.id },
      data: {
        deliveryStatus: newDeliveryStatus,
        paymentStatus: paymentStatusUpdate,
        invoiceData: JSON.stringify(invoiceJson),
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
