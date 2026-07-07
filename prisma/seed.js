const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Safa Kurtilab database...');

  // 1. Clear existing database entries
  await prisma.variant.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleaned old database records.');

  // 2. Create users (Admin & standard User)
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Director',
      email: 'admin@safakurtilab.com',
      password: 'admin_password_123',
      role: 'ADMIN',
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: 'B2B Client India',
      email: 'b2b@retailer.com',
      password: 'b2b_password_123',
      role: 'USER',
    },
  });

  console.log('Created accounts.');

  // 3. Read products.csv
  const CSV_FILE = path.join(process.cwd(), 'src/data/products.csv');
  if (!fs.existsSync(CSV_FILE)) {
    throw new Error(`Products CSV file not found at: ${CSV_FILE}`);
  }

  const rawData = fs.readFileSync(CSV_FILE, 'utf-8');
  const lines = rawData.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  
  if (lines.length <= 1) {
    throw new Error('CSV file is empty or only contains the header row.');
  }

  console.log(`Parsing and seeding ${lines.length - 1} products from CSV...`);

  const createdProductsList = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(',');
    if (cols.length < 9) {
      console.warn(`Skipping malformed row ${i + 1}: ${line}`);
      continue;
    }

    const rawTitle = cols[0];
    const title = rawTitle.replace(/Chavi Creations/g, 'Safa Couture').replace(/Chavi/g, 'Safa').replace(/Chhabi/g, 'Safa');
    const rawVendor = cols[1];
    const vendor = rawVendor.replace(/Chavi_Creations/g, 'Safa_Couture').replace(/Chavi/g, 'Safa').replace(/Chhabi/g, 'Safa');
    const baseRate = parseFloat(cols[2]);
    const listingPrice = parseFloat(cols[3]);
    const fabric = cols[4];
    const category = cols[5];
    const sizesStr = cols[6]; // e.g. "38;40;42;44" or "S;M;L;XL;XXL"
    const imagesStr = cols[7]; // e.g. semicolon-separated image paths
    const status = cols[8];

    // Generate unique slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = `${baseSlug}-${uniqueSuffix}`;

    const imageList = imagesStr ? imagesStr.split(';') : [];
    const primaryImage = imageList[0] || 'https://res.cloudinary.com/safakurtilab/image/upload/placeholder.jpg';

    // 1. Create Product
    const createdProduct = await prisma.product.create({
      data: {
        title,
        slug,
        description: `Premium B2B wholesale ${category}. Fabricated from ${fabric}. Crafted for comfortable fits and long-lasting durability. Listed under vendor ${vendor}.`,
        basePrice: listingPrice,
        images: primaryImage,
        category,
        discount: 0,
      }
    });

    // 2. Parse sizes and create variants
    const sizes = sizesStr ? sizesStr.split(';').map(s => s.trim()).filter(s => s.length > 0) : ['S', 'M', 'L', 'XL', 'XXL'];
    for (const size of sizes) {
      await prisma.variant.create({
        data: {
          productId: createdProduct.id,
          size,
          color: 'Default',
          stock: 50,
        }
      });
    }

    createdProductsList.push(createdProduct);
  }

  console.log(`Successfully seeded ${createdProductsList.length} products with dynamic variants.`);

  // 4. Seed an initial Order history for charts display using newly created products
  if (createdProductsList.length >= 2) {
    const sampleItems = [
      {
        id: createdProductsList[0].id,
        title: createdProductsList[0].title,
        price: createdProductsList[0].basePrice,
        quantity: 5, // MOQ B2B
        size: '38',
        color: 'Default',
      },
      {
        id: createdProductsList[1].id,
        title: createdProductsList[1].title,
        price: createdProductsList[1].basePrice,
        quantity: 5,
        size: '40',
        color: 'Default',
      },
    ];

    const totalAmt = createdProductsList[0].basePrice * 5 + createdProductsList[1].basePrice * 5;
    const gstAmt = totalAmt * 0.05;

    const baseDate = new Date();
    const dayMs = 24 * 60 * 60 * 1000;

    const ordersData = [
      {
        userId: customer.id,
        items: JSON.stringify(sampleItems),
        totalAmount: totalAmt,
        gstAmount: gstAmt,
        gstin: '07AAAAA1111A1Z1',
        companyName: 'Chic Boutique India',
        paymentStatus: 'PAID',
        deliveryStatus: 'DELIVERED',
        createdAt: new Date(baseDate.getTime() - 4 * dayMs),
      },
      {
        userId: customer.id,
        items: JSON.stringify(sampleItems),
        totalAmount: totalAmt,
        gstAmount: gstAmt,
        gstin: null,
        companyName: null,
        paymentStatus: 'PAID',
        deliveryStatus: 'SHIPPED',
        createdAt: new Date(baseDate.getTime() - 2 * dayMs),
      },
      {
        userId: customer.id,
        items: JSON.stringify(sampleItems),
        totalAmount: totalAmt,
        gstAmount: gstAmt,
        gstin: '07AAAAA1111A1Z1',
        companyName: 'B2B Retail Outlet',
        paymentStatus: 'PENDING',
        deliveryStatus: 'PROCESSING',
        createdAt: new Date(),
      },
    ];

    for (const o of ordersData) {
      await prisma.order.create({
        data: o,
      });
    }
    console.log('Seeded initial B2B orders history using new catalog references.');
  }

  console.log('🎉 Seeding operation completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
