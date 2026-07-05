// scripts/test-live-order.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('--- Triggering Live Production Integration Test ---');
  
  // 1. Create or retrieve the user
  const email = 'mdshariq2357@gmail.com';
  let user = await prisma.user.findFirst({ where: { email } });
  
  if (!user) {
    console.log(`Creating user: ${email}...`);
    user = await prisma.user.create({
      data: {
        name: 'Shariq Admin',
        email: email,
        password: 'admin_password_999',
        role: 'USER'
      }
    });
  }

  // 2. Create a test Order with West Bengal origin (to test CGST/SGST split live)
  console.log('\nCreating order in database...');
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      items: JSON.stringify([
        { title: 'Mustard Anarkali Set', quantity: 1, price: 5099.15, size: 'L', color: 'Mustard Gold' }
      ]),
      totalAmount: 5099.15,
      gstAmount: 254.96,
      state: 'West Bengal', // Match WB origin
      phone: '7003518485',
      address: '99 Salt Lake, Sector V, Block EP-GP',
      city: 'Kolkata',
      pincode: '700091',
      paymentStatus: 'PENDING',
      deliveryStatus: 'PROCESSING',
    }
  });
  console.log(`Successfully created Order ID: ${order.id}`);

  // 3. Trigger Webhook API over Vercel Production URL
  console.log('\nTriggering live webhook on Vercel: https://safa-kurtilab-bivv.vercel.app/api/webhooks/payment...');
  const response = await fetch('https://safa-kurtilab-bivv.vercel.app/api/webhooks/payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'payment.captured',
      orderId: order.id,
    })
  });

  const payload = await response.json();
  console.log('Vercel Webhook Response Status:', response.status);
  console.log('Vercel Webhook Response Payload:', JSON.stringify(payload, null, 2));

  console.log('\n--- Live Integration Test Completed! ---');
  console.log('💡 Refresh your live Admin Command Center browser tab (https://safa-kurtilab-bivv.vercel.app/admin) to view the order!');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
