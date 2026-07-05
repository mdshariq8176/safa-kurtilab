// Safa Kurtilab Database Seeding Script
const { PrismaClient } = require('@prisma/client');
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
      password: 'admin_password_123', // Clean, simple password for demonstration
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

  console.log('Created Admin and Customer accounts.');

  // 3. Create products with sizing, color variants, and deliberate low-stock levels
  const products = [
    {
      title: 'Emerald Royale Silk Kurta',
      slug: 'emerald-royale-silk-kurta',
      description: 'Experience pure opulence with our signature Emerald Royale Silk Kurta. Handcrafted from premium Banarasi silk, this straight-cut masterpiece features intricate gold zari embroidery around the neck and sleeves. Ideal for festive gatherings and elite celebrations.',
      basePrice: 4299,
      discount: 10, // 10% discount
      images: '/images/emerald-kurta.png',
      category: 'Straight Cut',
      variants: [
        { size: 'S', color: 'Emerald', stock: 12 },
        { size: 'M', color: 'Emerald', stock: 15 },
        { size: 'L', color: 'Emerald', stock: 3 }, // Alert trigger (stock < 5)
        { size: 'XL', color: 'Emerald', stock: 8 },
        { size: 'XXL', color: 'Emerald', stock: 2 }, // Alert trigger (stock < 5)
      ],
    },
    {
      title: 'Vibrant Mustard Anarkali Set',
      slug: 'vibrant-mustard-anarkali-set',
      description: 'A radiant ensemble designed to capture hearts. Crafted from soft georgette, this floor-length Anarkali offers a majestic flare of over 4 meters. Adorned with delicate gold sequin borders and paired with a rich organza dupatta.',
      basePrice: 5999,
      discount: 15,
      images: '/images/mustard-anarkali.png',
      category: 'Anarkali',
      variants: [
        { size: 'S', color: 'Mustard Gold', stock: 8 },
        { size: 'M', color: 'Mustard Gold', stock: 10 },
        { size: 'L', color: 'Mustard Gold', stock: 4 }, // Alert trigger (stock < 5)
        { size: 'XL', color: 'Mustard Gold', stock: 6 },
        { size: 'XXL', color: 'Mustard Gold', stock: 1 }, // Alert trigger (stock < 5)
      ],
    },
    {
      title: 'Crimson Elegance Velvet Kurti',
      slug: 'crimson-elegance-velvet-kurti',
      description: 'Embrace royal winter warmth in our rich velvet A-line Kurti. Designed with a deep ruby red texture and lined with silver thread gota-patti embroidery along the collar and hemline. Soft, warm, and highly comfortable.',
      basePrice: 4999,
      discount: 5,
      images: '/images/velvet-kurti.png',
      category: 'A-Line',
      variants: [
        { size: 'S', color: 'Crimson Velvet', stock: 10 },
        { size: 'M', color: 'Crimson Velvet', stock: 14 },
        { size: 'L', color: 'Crimson Velvet', stock: 12 },
        { size: 'XL', color: 'Crimson Velvet', stock: 3 }, // Alert trigger (stock < 5)
        { size: 'XXL', color: 'Crimson Velvet', stock: 0 }, // Out of stock
      ],
    },
  ];

  for (const item of products) {
    const createdProduct = await prisma.product.create({
      data: {
        title: item.title,
        slug: item.slug,
        description: item.description,
        basePrice: item.basePrice,
        discount: item.discount,
        images: item.images,
        category: item.category,
      },
    });

    for (const v of item.variants) {
      await prisma.variant.create({
        data: {
          productId: createdProduct.id,
          size: v.size,
          color: v.color,
          stock: v.stock,
        },
      });
    }
  }

  // 4. Seed an initial Order history for charts display
  const allProducts = await prisma.product.findMany();
  const sampleItems = [
    {
      id: allProducts[0].id,
      title: allProducts[0].title,
      price: 3869.1, // Price after 10% discount from 4299
      quantity: 2,
      size: 'M',
      color: 'Emerald',
    },
    {
      id: allProducts[1].id,
      title: allProducts[1].title,
      price: 5099.15, // Price after 15% discount from 5999
      quantity: 1,
      size: 'L',
      color: 'Mustard Gold',
    },
  ];

  // Seed sample orders across different dates (for Recharts graphs)
  const baseDate = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const ordersData = [
    {
      userId: customer.id,
      items: JSON.stringify(sampleItems),
      totalAmount: 12837.35,
      gstAmount: 641.87,
      gstin: '07AAAAA1111A1Z1',
      companyName: 'Chic Boutique India',
      paymentStatus: 'PAID',
      deliveryStatus: 'DELIVERED',
      createdAt: new Date(baseDate.getTime() - 4 * dayMs),
    },
    {
      userId: customer.id,
      items: JSON.stringify([sampleItems[0]]),
      totalAmount: 3869.1,
      gstAmount: 193.45,
      gstin: '07AAAAA1111A1Z1',
      companyName: 'Chic Boutique India',
      paymentStatus: 'PAID',
      deliveryStatus: 'SHIPPED',
      createdAt: new Date(baseDate.getTime() - 3 * dayMs),
    },
    {
      userId: customer.id,
      items: JSON.stringify([sampleItems[1]]),
      totalAmount: 5099.15,
      gstAmount: 254.96,
      gstin: null,
      companyName: null,
      paymentStatus: 'PAID',
      deliveryStatus: 'PROCESSING',
      createdAt: new Date(baseDate.getTime() - 2 * dayMs),
    },
    {
      userId: customer.id,
      items: JSON.stringify(sampleItems),
      totalAmount: 12837.35,
      gstAmount: 641.87,
      gstin: '27BBBBB2222B2Z2',
      companyName: 'Vastra Collections',
      paymentStatus: 'PAID',
      deliveryStatus: 'PROCESSING',
      createdAt: new Date(baseDate.getTime() - 1 * dayMs),
    },
    {
      userId: customer.id,
      items: JSON.stringify([sampleItems[0]]),
      totalAmount: 3869.1,
      gstAmount: 193.45,
      gstin: null,
      companyName: null,
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

  console.log('Seeded database orders history successfully.');
  console.log('Database seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
