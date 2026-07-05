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
    {
      title: 'Indigo Handblock Cotton Kurta',
      slug: 'indigo-handblock-cotton-kurta',
      description: 'Traditional Indian artistry meets daily comfort. Crafted from pure handloom cotton and dyed in organic indigo, this straight-cut kurta features elegant white handblock printed patterns. Highly breathable and perfect for office or casual wear.',
      basePrice: 3299,
      discount: 10,
      images: '/images/indigo-cotton-kurta.png',
      category: 'Straight Cut',
      variants: [
        { size: 'S', color: 'Indigo Blue', stock: 12 },
        { size: 'M', color: 'Indigo Blue', stock: 15 },
        { size: 'L', color: 'Indigo Blue', stock: 4 },
        { size: 'XL', color: 'Indigo Blue', stock: 8 },
        { size: 'XXL', color: 'Indigo Blue', stock: 3 },
      ],
    },
    {
      title: 'Pastel Floral Organza Anarkali',
      slug: 'pastel-floral-organza-anarkali',
      description: 'A majestic floor-length Anarkali suit designed for premium celebrations. Crafted from premium transparent organza silk with elegant hand-painted pink floral motifs and gold zari borders. Includes matching trousers and a sheer dupatta.',
      basePrice: 6499,
      discount: 12,
      images: '/images/pastel-pink-anarkali.png',
      category: 'Anarkali',
      variants: [
        { size: 'S', color: 'Pastel Pink', stock: 6 },
        { size: 'M', color: 'Pastel Pink', stock: 10 },
        { size: 'L', color: 'Pastel Pink', stock: 12 },
        { size: 'XL', color: 'Pastel Pink', stock: 5 },
        { size: 'XXL', color: 'Pastel Pink', stock: 2 },
      ],
    },
    {
      title: 'Ruby Mirror Georgette Kurta',
      slug: 'ruby-mirror-georgette-kurta',
      description: 'Dazzle in rich hues with our straight-cut Ruby Red Kurta. Sewn from lightweight, fluid georgette fabric, it is highlighted by exquisite hand-stitched mirror work around the notched neckline and hem. Glamorous and lightweight.',
      basePrice: 4599,
      discount: 15,
      images: '/images/ruby-red-straight.png',
      category: 'Straight Cut',
      variants: [
        { size: 'S', color: 'Ruby Red', stock: 9 },
        { size: 'M', color: 'Ruby Red', stock: 8 },
        { size: 'L', color: 'Ruby Red', stock: 3 },
        { size: 'XL', color: 'Ruby Red', stock: 7 },
        { size: 'XXL', color: 'Ruby Red', stock: 4 },
      ],
    },
    {
      title: 'Mint Pearl Chanderi Kurti',
      slug: 'mint-pearl-chanderi-kurti',
      description: 'Understated elegance in every thread. Made from soft mint green Chanderi silk, this A-line silhouette is accented with delicate hand-embroidered pearls along the collar. Fits beautifully and adds grace to any occasion.',
      basePrice: 4999,
      discount: 10,
      images: '/images/mint-green-chanderi.png',
      category: 'A-Line',
      variants: [
        { size: 'S', color: 'Mint Green', stock: 11 },
        { size: 'M', color: 'Mint Green', stock: 14 },
        { size: 'L', color: 'Mint Green', stock: 6 },
        { size: 'XL', color: 'Mint Green', stock: 3 },
        { size: 'XXL', color: 'Mint Green', stock: 5 },
      ],
    },
    {
      title: 'Ivory Lucknowi Chikankari Kurta',
      slug: 'ivory-lucknowi-chikankari-kurta',
      description: 'Own a slice of Lucknowi heritage. Hand-embroidered in white cotton threads over an ivory georgette base, this straight-cut masterpiece features traditional shadow-work and border motifs. Lightweight, elegant, and timeless.',
      basePrice: 5299,
      discount: 8,
      images: '/images/ivory-white-chikankari.png',
      category: 'Straight Cut',
      variants: [
        { size: 'S', color: 'Ivory White', stock: 8 },
        { size: 'M', color: 'Ivory White', stock: 10 },
        { size: 'L', color: 'Ivory White', stock: 4 },
        { size: 'XL', color: 'Ivory White', stock: 6 },
        { size: 'XXL', color: 'Ivory White', stock: 1 },
      ],
    },
    {
      title: 'Lavender Flared Georgette Kurti',
      slug: 'lavender-flared-georgette-kurti',
      description: 'A modern ethnic marvel in lavender. Crafted from rich, heavy georgette, this flared A-line kurti moves gracefully. Designed with a sleek keyhole neckline and gold piping borders for a sleek modern outline.',
      basePrice: 3999,
      discount: 5,
      images: '/images/lavender-purple-georgette.png',
      category: 'A-Line',
      variants: [
        { size: 'S', color: 'Lavender Purple', stock: 14 },
        { size: 'M', color: 'Lavender Purple', stock: 12 },
        { size: 'L', color: 'Lavender Purple', stock: 7 },
        { size: 'XL', color: 'Lavender Purple', stock: 2 },
        { size: 'XXL', color: 'Lavender Purple', stock: 4 },
      ],
    },
    {
      title: 'Peach Lace Mulmul Kurta',
      slug: 'peach-lace-mulmul-kurta',
      description: 'Pure comfort for warm weather. Crafted from premium organic mulmul cotton, this A-line kurti features soft crochet lace detail along the panels and cuffs. Incredibly soft against the skin.',
      basePrice: 3599,
      discount: 10,
      images: '/images/peach-mulmul-cotton.png',
      category: 'A-Line',
      variants: [
        { size: 'S', color: 'Soft Peach', stock: 10 },
        { size: 'M', color: 'Soft Peach', stock: 15 },
        { size: 'L', color: 'Soft Peach', stock: 3 },
        { size: 'XL', color: 'Soft Peach', stock: 5 },
        { size: 'XXL', color: 'Soft Peach', stock: 2 },
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
