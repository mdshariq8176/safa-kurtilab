// scripts/test-webhook-returns.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTest() {
  console.log('--- Starting Webhook Returns & Stock Recovery Integration Test ---');

  // 1. Fetch a product and its variant to test with
  const product = await prisma.product.findFirst({
    include: { variants: true }
  });

  if (!product) {
    console.error('❌ Error: No products found in the database. Run prisma/seed.js first.');
    return;
  }

  const targetVariant = product.variants[0];
  const initialStock = targetVariant.stock;
  console.log(`Target Product: "${product.title}"`);
  console.log(`Target Variant Color: "${targetVariant.color}" | Size: "${targetVariant.size}"`);
  console.log(`Initial Stock Level: ${initialStock} units`);

  // 2. Fetch or create a test user
  const email = 'webhook-test-client@safakurtilab.com';
  let user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Webhook Test Client',
        email: email,
        password: 'test_password_123',
        role: 'USER'
      }
    });
  }

  // 3. Create a test Order
  const itemQty = 3;
  console.log(`\nCreating mock Order with quantity: ${itemQty} units...`);
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      items: JSON.stringify([
        {
          id: product.id,
          title: product.title,
          price: product.basePrice,
          quantity: itemQty,
          size: targetVariant.size,
          color: targetVariant.color
        }
      ]),
      totalAmount: product.basePrice * itemQty,
      gstAmount: (product.basePrice * itemQty) * 0.05,
      state: 'Delhi',
      phone: '9999988888',
      address: 'Test Studio, Delhi',
      city: 'New Delhi',
      pincode: '110049',
      paymentStatus: 'PENDING',
      deliveryStatus: 'PROCESSING'
    }
  });

  console.log(`Successfully created Order ID: ${order.id}`);

  // 4. Simulate a logistics Webhook call with status: 'returned'
  // Since we want to test our route locally, we can import the webhook logic directly, 
  // or trigger it via an HTTP fetch. To do this, we can fetch from localhost:3000/api/orders/webhook 
  // if the server is running, or we can mock call the API logic.
  // Wait, let's trigger it by calling our local development server!
  // But wait! Is the development server running?
  // We can launch the dev server in the background as a task, or we can mock-test the API logic.
  // Actually, we can trigger the fetch command if the server is running, or we can easily run the server.
  // Let's see: we can test it by launching Next.js in dev mode, waiting 3 seconds, and firing the webhook!
  // Let's write the fetch trigger code.
  console.log('\nTriggering webhook endpoint POST request to http://localhost:3000/api/orders/webhook...');
  try {
    const response = await fetch('http://localhost:3000/api/orders/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order.id,
        status: 'returned' // RTO status
      })
    });

    const resPayload = await response.json();
    console.log('Webhook Response Status:', response.status);
    console.log('Webhook Response Payload:', JSON.stringify(resPayload, null, 2));

    // 5. Query the database to verify order update and inventory increment
    const updatedOrder = await prisma.order.findUnique({ where: { id: order.id } });
    const updatedVariant = await prisma.variant.findUnique({ where: { id: targetVariant.id } });

    console.log('\n--- Post-Webhook Verification ---');
    console.log(`Updated Order Delivery Status: "${updatedOrder.deliveryStatus}" (Expected: "RETURNED")`);
    console.log(`Updated Stock Level: ${updatedVariant.stock} units (Expected: ${initialStock + itemQty} units)`);

    if (updatedOrder.deliveryStatus === 'RETURNED' && updatedVariant.stock === (initialStock + itemQty)) {
      console.log('🎉 Integration Test Succeeded! Inventory reverse sync transitions completed successfully.');
    } else {
      console.error('❌ Integration Test Failed. Stock counts or status updates did not match expected values.');
    }

  } catch (err) {
    console.error('❌ Failed calling local server webhook (make sure "npm run dev" is running at port 3000):', err.message);
  }

  console.log('\n--- Integration Test Completed! ---');
}

runTest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
