// Safa Kurtilab Database Seeding Script - Expanded 50 Product Catalog
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

  // 3. Define 50 products across 10 categories (5 products per category)
  const products = [
    // --- CATEGORY 1: Straight Cut ---
    {
      title: 'Emerald Royale Silk Kurta',
      slug: 'emerald-royale-silk-kurta',
      description: 'Experience pure opulence with our signature Emerald Royale Silk Kurta. Handcrafted from premium Banarasi silk, this straight-cut masterpiece features intricate gold zari embroidery around the neck and sleeves.',
      basePrice: 4299,
      discount: 10,
      images: '/images/emerald-kurta.png',
      category: 'Straight Cut',
      variants: [
        { size: 'S', color: 'Emerald', stock: 12 },
        { size: 'M', color: 'Emerald', stock: 15 },
        { size: 'L', color: 'Emerald', stock: 3 },
        { size: 'XL', color: 'Emerald', stock: 8 },
        { size: 'XXL', color: 'Emerald', stock: 2 },
      ]
    },
    {
      title: 'Royal Blue Banarasi Straight Kurta',
      slug: 'royal-blue-banarasi-straight-kurta',
      description: 'Exquisite royal blue Banarasi silk straight kurta. Woven with metallic silver threads forming intricate floral bootis, completed with a premium lining for comfortable all-day wear.',
      basePrice: 3899,
      discount: 5,
      images: '/images/indigo-cotton-kurta.png',
      category: 'Straight Cut',
      variants: [
        { size: 'S', color: 'Royal Blue', stock: 8 },
        { size: 'M', color: 'Royal Blue', stock: 10 },
        { size: 'L', color: 'Royal Blue', stock: 5 },
        { size: 'XL', color: 'Royal Blue', stock: 12 },
        { size: 'XXL', color: 'Royal Blue', stock: 3 },
      ]
    },
    {
      title: 'Ruby Red Georgette Straight Kurti',
      slug: 'ruby-red-georgette-straight-kurti',
      description: 'Lightweight and elegant straight-cut georgette Kurti in deep ruby red. Showcases delicate mirror work on the collar and cuffs, matching perfectly with silk trousers.',
      basePrice: 4599,
      discount: 15,
      images: '/images/ruby-red-straight.png',
      category: 'Straight Cut',
      variants: [
        { size: 'S', color: 'Ruby Red', stock: 9 },
        { size: 'M', color: 'Ruby Red', stock: 11 },
        { size: 'L', color: 'Ruby Red', stock: 4 },
        { size: 'XL', color: 'Ruby Red', stock: 6 },
        { size: 'XXL', color: 'Ruby Red', stock: 2 },
      ]
    },
    {
      title: 'Turquoise Silk Straight Kurta',
      slug: 'turquoise-silk-straight-kurta',
      description: 'Premium raw silk straight kurta in refreshing turquoise. Designed with elegant hand-painted neckline patterns and border lace details for a modern formal ethnic silhouette.',
      basePrice: 3499,
      discount: 10,
      images: '/images/emerald-georgette-kurta.png',
      category: 'Straight Cut',
      variants: [
        { size: 'S', color: 'Turquoise', stock: 14 },
        { size: 'M', color: 'Turquoise', stock: 10 },
        { size: 'L', color: 'Turquoise', stock: 7 },
        { size: 'XL', color: 'Turquoise', stock: 5 },
        { size: 'XXL', color: 'Turquoise', stock: 0 },
      ]
    },
    {
      title: 'Mustard Silk Zari Kurti',
      slug: 'mustard-silk-zari-kurti',
      description: 'Classic mustard silk straight-cut kurta with gold zari lining. Accented with subtle thread embroidery, offering a rich look with lightweight comfort.',
      basePrice: 3799,
      discount: 8,
      images: '/images/mustard-anarkali.png',
      category: 'Straight Cut',
      variants: [
        { size: 'S', color: 'Mustard Gold', stock: 10 },
        { size: 'M', color: 'Mustard Gold', stock: 12 },
        { size: 'L', color: 'Mustard Gold', stock: 6 },
        { size: 'XL', color: 'Mustard Gold', stock: 4 },
        { size: 'XXL', color: 'Mustard Gold', stock: 1 },
      ]
    },

    // --- CATEGORY 2: Anarkali ---
    {
      title: 'Vibrant Mustard Anarkali Set',
      slug: 'vibrant-mustard-anarkali-set',
      description: 'A radiant ensemble designed to capture hearts. Crafted from soft georgette, this floor-length Anarkali offers a majestic flare of over 4 meters. Adorned with delicate gold sequin borders.',
      basePrice: 5999,
      discount: 15,
      images: '/images/mustard-anarkali.png',
      category: 'Anarkali',
      variants: [
        { size: 'S', color: 'Mustard Gold', stock: 8 },
        { size: 'M', color: 'Mustard Gold', stock: 10 },
        { size: 'L', color: 'Mustard Gold', stock: 4 },
        { size: 'XL', color: 'Mustard Gold', stock: 6 },
        { size: 'XXL', color: 'Mustard Gold', stock: 1 },
      ]
    },
    {
      title: 'Pastel Floral Organza Anarkali',
      slug: 'pastel-floral-organza-anarkali',
      description: 'A majestic floor-length Anarkali suit designed for premium celebrations. Crafted from premium transparent organza silk with elegant hand-painted pink floral motifs.',
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
      ]
    },
    {
      title: 'Mint Green Flared Anarkali',
      slug: 'mint-green-flared-anarkali',
      description: 'Mint green silk flared Anarkali set. Handcrafted panels with matching gota-patti border work, paired with an elegant sheer georgette dupatta.',
      basePrice: 5499,
      discount: 10,
      images: '/images/mint-green-chanderi.png',
      category: 'Anarkali',
      variants: [
        { size: 'S', color: 'Mint Green', stock: 9 },
        { size: 'M', color: 'Mint Green', stock: 8 },
        { size: 'L', color: 'Mint Green', stock: 5 },
        { size: 'XL', color: 'Mint Green', stock: 7 },
        { size: 'XXL', color: 'Mint Green', stock: 3 },
      ]
    },
    {
      title: 'Royal Crimson Georgette Anarkali',
      slug: 'royal-crimson-georgette-anarkali',
      description: 'Breath-taking crimson red flared Anarkali kurta. Features beautiful gold borders and heavy neck zari embroidery, perfect for wedding guests and family dinners.',
      basePrice: 5899,
      discount: 10,
      images: '/images/velvet-kurti.png',
      category: 'Anarkali',
      variants: [
        { size: 'S', color: 'Crimson Red', stock: 7 },
        { size: 'M', color: 'Crimson Red', stock: 12 },
        { size: 'L', color: 'Crimson Red', stock: 4 },
        { size: 'XL', color: 'Crimson Red', stock: 8 },
        { size: 'XXL', color: 'Crimson Red', stock: 0 },
      ]
    },
    {
      title: 'Ivory Gold Silk Anarkali Suit',
      slug: 'ivory-gold-silk-anarkali-suit',
      description: 'Sophisticated ivory white silk Anarkali kurta with matte gold border paneling. Brings a royal, luxurious heritage appearance to formal functions.',
      basePrice: 6299,
      discount: 8,
      images: '/images/ivory-white-chikankari.png',
      category: 'Anarkali',
      variants: [
        { size: 'S', color: 'Ivory White', stock: 5 },
        { size: 'M', color: 'Ivory White', stock: 11 },
        { size: 'L', color: 'Ivory White', stock: 6 },
        { size: 'XL', color: 'Ivory White', stock: 4 },
        { size: 'XXL', color: 'Ivory White', stock: 2 },
      ]
    },

    // --- CATEGORY 3: A-Line ---
    {
      title: 'Crimson Elegance Velvet Kurti',
      slug: 'crimson-elegance-velvet-kurti',
      description: 'Embrace royal winter warmth in our rich velvet A-line Kurti. Designed with a deep ruby red texture and lined with silver thread gota-patti embroidery along the collar.',
      basePrice: 4999,
      discount: 5,
      images: '/images/velvet-kurti.png',
      category: 'A-Line',
      variants: [
        { size: 'S', color: 'Crimson Velvet', stock: 10 },
        { size: 'M', color: 'Crimson Velvet', stock: 14 },
        { size: 'L', color: 'Crimson Velvet', stock: 12 },
        { size: 'XL', color: 'Crimson Velvet', stock: 3 },
        { size: 'XXL', color: 'Crimson Velvet', stock: 0 },
      ]
    },
    {
      title: 'Mint Pearl Chanderi Kurti',
      slug: 'mint-pearl-chanderi-kurti',
      description: 'Understated elegance in every thread. Made from soft mint green Chanderi silk, this A-line silhouette is accented with delicate hand-embroidered pearls along the collar.',
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
      ]
    },
    {
      title: 'Lavender Flared Georgette Kurti',
      slug: 'lavender-flared-georgette-kurti',
      description: 'A modern ethnic marvel in lavender. Crafted from rich, heavy georgette, this flared A-line kurti moves gracefully. Designed with a sleek keyhole neckline.',
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
      ]
    },
    {
      title: 'Peach Lace Mulmul Kurta',
      slug: 'peach-lace-mulmul-kurta',
      description: 'Pure comfort for warm weather. Crafted from premium organic mulmul cotton, this A-line kurti features soft crochet lace detail along the panels and cuffs.',
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
      ]
    },
    {
      title: 'Emerald Flared A-Line Kurta',
      slug: 'emerald-flared-a-line-kurta',
      description: 'Emerald green georgette flared A-line kurta. High collar style lined with metallic borders, offering a slim structured silhouette.',
      basePrice: 4299,
      discount: 10,
      images: '/images/emerald-georgette-kurta.png',
      category: 'A-Line',
      variants: [
        { size: 'S', color: 'Emerald Green', stock: 8 },
        { size: 'M', color: 'Emerald Green', stock: 12 },
        { size: 'L', color: 'Emerald Green', stock: 5 },
        { size: 'XL', color: 'Emerald Green', stock: 9 },
        { size: 'XXL', color: 'Emerald Green', stock: 3 },
      ]
    },

    // --- CATEGORY 4: Lucknowi Chikankari ---
    {
      title: 'Ivory Lucknowi Chikankari Kurta',
      slug: 'ivory-lucknowi-chikankari-kurta',
      description: 'Own a slice of Lucknowi heritage. Hand-embroidered in white cotton threads over an ivory georgette base, this straight-cut masterpiece features traditional shadow-work.',
      basePrice: 5299,
      discount: 8,
      images: '/images/ivory-white-chikankari.png',
      category: 'Lucknowi Chikankari',
      variants: [
        { size: 'S', color: 'Ivory White', stock: 8 },
        { size: 'M', color: 'Ivory White', stock: 10 },
        { size: 'L', color: 'Ivory White', stock: 4 },
        { size: 'XL', color: 'Ivory White', stock: 6 },
        { size: 'XXL', color: 'Ivory White', stock: 1 },
      ]
    },
    {
      title: 'Peach Chikankari Cotton Kurti',
      slug: 'peach-chikankari-cotton-kurti',
      description: 'Soft peach cotton fabric hand-embroidered with classic Lucknowi floral motifs. Highly breathable and perfect for office or daytime events.',
      basePrice: 3499,
      discount: 5,
      images: '/images/peach-mulmul-cotton.png',
      category: 'Lucknowi Chikankari',
      variants: [
        { size: 'S', color: 'Soft Peach', stock: 12 },
        { size: 'M', color: 'Soft Peach', stock: 14 },
        { size: 'L', color: 'Soft Peach', stock: 7 },
        { size: 'XL', color: 'Soft Peach', stock: 5 },
        { size: 'XXL', color: 'Soft Peach', stock: 3 },
      ]
    },
    {
      title: 'Lavender Georgette Chikankari Kurta',
      slug: 'lavender-georgette-chikankari-kurta',
      description: 'Stunning georgette Lucknowi Chikankari kurta in pastel lavender. Beautiful all-over shadow work embroidery matching with premium pearl accessories.',
      basePrice: 4599,
      discount: 10,
      images: '/images/lavender-purple-georgette.png',
      category: 'Lucknowi Chikankari',
      variants: [
        { size: 'S', color: 'Lavender Purple', stock: 10 },
        { size: 'M', color: 'Lavender Purple', stock: 12 },
        { size: 'L', color: 'Lavender Purple', stock: 6 },
        { size: 'XL', color: 'Lavender Purple', stock: 8 },
        { size: 'XXL', color: 'Lavender Purple', stock: 2 },
      ]
    },
    {
      title: 'Mint Green Chikankari Chanderi',
      slug: 'mint-green-chikankari-chanderi',
      description: 'Traditional Chikankari threadwork on mint green Chanderi silk base. Seamless combination of sheer material finish and detailed handcraft.',
      basePrice: 4999,
      discount: 12,
      images: '/images/mint-green-chanderi.png',
      category: 'Lucknowi Chikankari',
      variants: [
        { size: 'S', color: 'Mint Green', stock: 8 },
        { size: 'M', color: 'Mint Green', stock: 11 },
        { size: 'L', color: 'Mint Green', stock: 5 },
        { size: 'XL', color: 'Mint Green', stock: 7 },
        { size: 'XXL', color: 'Mint Green', stock: 1 },
      ]
    },
    {
      title: 'Indigo Lucknowi Handblock Kurta',
      slug: 'indigo-lucknowi-handblock-kurta',
      description: 'Unique custom design featuring Lucknowi style Chikankari thread accents overlaid on organic handblock indigo cotton.',
      basePrice: 3899,
      discount: 8,
      images: '/images/indigo-cotton-kurta.png',
      category: 'Lucknowi Chikankari',
      variants: [
        { size: 'S', color: 'Indigo Blue', stock: 15 },
        { size: 'M', color: 'Indigo Blue', stock: 12 },
        { size: 'L', color: 'Indigo Blue', stock: 6 },
        { size: 'XL', color: 'Indigo Blue', stock: 9 },
        { size: 'XXL', color: 'Indigo Blue', stock: 4 },
      ]
    },

    // --- CATEGORY 5: Angrakha Flare ---
    {
      title: 'Royal Mustard Angrakha Suit',
      slug: 'royal-mustard-angrakha-suit',
      description: 'Elegant mustard yellow flared Angrakha style kurta. Wrapped design panels secured with handmade side tassels and detailed gold piping.',
      basePrice: 5499,
      discount: 15,
      images: '/images/mustard-anarkali.png',
      category: 'Angrakha Flare',
      variants: [
        { size: 'S', color: 'Mustard Gold', stock: 6 },
        { size: 'M', color: 'Mustard Gold', stock: 10 },
        { size: 'L', color: 'Mustard Gold', stock: 4 },
        { size: 'XL', color: 'Mustard Gold', stock: 8 },
        { size: 'XXL', color: 'Mustard Gold', stock: 2 },
      ]
    },
    {
      title: 'Emerald Angrakha Banarasi Silk',
      slug: 'emerald-angrakha-banarasi-silk',
      description: 'Luxurious Banarasi silk Angrakha wrap kurta. Woven with premium gold threads creating traditional border lines, ideal for grand weddings.',
      basePrice: 5999,
      discount: 10,
      images: '/images/emerald-kurta.png',
      category: 'Angrakha Flare',
      variants: [
        { size: 'S', color: 'Emerald Green', stock: 5 },
        { size: 'M', color: 'Emerald Green', stock: 8 },
        { size: 'L', color: 'Emerald Green', stock: 3 },
        { size: 'XL', color: 'Emerald Green', stock: 7 },
        { size: 'XXL', color: 'Emerald Green', stock: 2 },
      ]
    },
    {
      title: 'Indigo Cotton Angrakha Kurti',
      slug: 'indigo-cotton-angrakha-kurti',
      description: 'Comfortable daily wear indigo cotton Angrakha kurta. Features a cross-over neck style lined with white print accents.',
      basePrice: 3299,
      discount: 10,
      images: '/images/indigo-cotton-kurta.png',
      category: 'Angrakha Flare',
      variants: [
        { size: 'S', color: 'Indigo Blue', stock: 10 },
        { size: 'M', color: 'Indigo Blue', stock: 14 },
        { size: 'L', color: 'Indigo Blue', stock: 8 },
        { size: 'XL', color: 'Indigo Blue', stock: 11 },
        { size: 'XXL', color: 'Indigo Blue', stock: 5 },
      ]
    },
    {
      title: 'Pastel Pink Organza Angrakha',
      slug: 'pastel-pink-organza-angrakha',
      description: 'Designer sheer organza pink Angrakha suit. Features beautiful hand-painted details and flared flowy layers.',
      basePrice: 6299,
      discount: 12,
      images: '/images/pastel-pink-anarkali.png',
      category: 'Angrakha Flare',
      variants: [
        { size: 'S', color: 'Pastel Pink', stock: 7 },
        { size: 'M', color: 'Pastel Pink', stock: 9 },
        { size: 'L', color: 'Pastel Pink', stock: 11 },
        { size: 'XL', color: 'Pastel Pink', stock: 6 },
        { size: 'XXL', color: 'Pastel Pink', stock: 1 },
      ]
    },
    {
      title: 'Crimson Velvet Silk Angrakha',
      slug: 'crimson-velvet-silk-angrakha',
      description: 'Ultra-luxurious deep crimson velvet silk Angrakha wrap. Features heavy silver thread handcraft embroidery, perfect for premium functions.',
      basePrice: 6999,
      discount: 5,
      images: '/images/velvet-kurti.png',
      category: 'Angrakha Flare',
      variants: [
        { size: 'S', color: 'Crimson Red', stock: 4 },
        { size: 'M', color: 'Crimson Red', stock: 6 },
        { size: 'L', color: 'Crimson Red', stock: 5 },
        { size: 'XL', color: 'Crimson Red', stock: 8 },
        { size: 'XXL', color: 'Crimson Red', stock: 1 },
      ]
    },

    // --- CATEGORY 6: Chanderi Silk ---
    {
      title: 'Mint Chanderi Zardozi Kurta',
      slug: 'mint-chanderi-zardozi-kurta',
      description: 'Premium mint green Chanderi silk straight kurta. Intricate zardozi gold embroidery along the collar, paired with a cotton slip.',
      basePrice: 4899,
      discount: 10,
      images: '/images/mint-green-chanderi.png',
      category: 'Chanderi Silk',
      variants: [
        { size: 'S', color: 'Mint Green', stock: 11 },
        { size: 'M', color: 'Mint Green', stock: 14 },
        { size: 'L', color: 'Mint Green', stock: 6 },
        { size: 'XL', color: 'Mint Green', stock: 8 },
        { size: 'XXL', color: 'Mint Green', stock: 4 },
      ]
    },
    {
      title: 'Peach Chanderi Silk Kurti',
      slug: 'peach-chanderi-silk-kurti',
      description: 'Elegant peach flared Chanderi silk kurta. Smooth, light texture with beautiful sheen, perfect for summer family dinners.',
      basePrice: 4299,
      discount: 5,
      images: '/images/peach-mulmul-cotton.png',
      category: 'Chanderi Silk',
      variants: [
        { size: 'S', color: 'Soft Peach', stock: 8 },
        { size: 'M', color: 'Soft Peach', stock: 10 },
        { size: 'L', color: 'Soft Peach', stock: 5 },
        { size: 'XL', color: 'Soft Peach', stock: 7 },
        { size: 'XXL', color: 'Soft Peach', stock: 2 },
      ]
    },
    {
      title: 'Lavender Chanderi Gota-Patti',
      slug: 'lavender-chanderi-gota-patti',
      description: 'Lavender Chanderi silk kurta with silver gota-patti accents. Highly reflective trim lines add a modern designer touch.',
      basePrice: 4699,
      discount: 10,
      images: '/images/lavender-purple-georgette.png',
      category: 'Chanderi Silk',
      variants: [
        { size: 'S', color: 'Lavender Purple', stock: 9 },
        { size: 'M', color: 'Lavender Purple', stock: 12 },
        { size: 'L', color: 'Lavender Purple', stock: 6 },
        { size: 'XL', color: 'Lavender Purple', stock: 9 },
        { size: 'XXL', color: 'Lavender Purple', stock: 3 },
      ]
    },
    {
      title: 'Ivory Chanderi Motif Kurta',
      slug: 'ivory-chanderi-motif-kurta',
      description: 'Ivory white Chanderi silk kurta showcasing subtle golden floral block motifs. Elegant designer option for formal B2B catalogs.',
      basePrice: 4799,
      discount: 8,
      images: '/images/ivory-white-chikankari.png',
      category: 'Chanderi Silk',
      variants: [
        { size: 'S', color: 'Ivory White', stock: 7 },
        { size: 'M', color: 'Ivory White', stock: 10 },
        { size: 'L', color: 'Ivory White', stock: 4 },
        { size: 'XL', color: 'Ivory White', stock: 6 },
        { size: 'XXL', color: 'Ivory White', stock: 1 },
      ]
    },
    {
      title: 'Royal Indigo Chanderi Silk Set',
      slug: 'royal-indigo-chanderi-silk-set',
      description: 'Grand indigo blue Chanderi silk kurta with matching trousers. Royal sheen and detailed neck embellishments make it a premium outfit.',
      basePrice: 5199,
      discount: 12,
      images: '/images/indigo-cotton-kurta.png',
      category: 'Chanderi Silk',
      variants: [
        { size: 'S', color: 'Indigo Blue', stock: 10 },
        { size: 'M', color: 'Indigo Blue', stock: 12 },
        { size: 'L', color: 'Indigo Blue', stock: 6 },
        { size: 'XL', color: 'Indigo Blue', stock: 8 },
        { size: 'XXL', color: 'Indigo Blue', stock: 2 },
      ]
    },

    // --- CATEGORY 7: Short Kurti ---
    {
      title: 'Indigo Short Peplum Kurti',
      slug: 'indigo-short-peplum-kurti',
      description: 'Fun and breezy indigo short cotton kurta. Tailored in a modern peplum flared cut, perfect to pair with denim or white trousers.',
      basePrice: 1999,
      discount: 10,
      images: '/images/indigo-cotton-kurta.png',
      category: 'Short Kurti',
      variants: [
        { size: 'S', color: 'Indigo Blue', stock: 15 },
        { size: 'M', color: 'Indigo Blue', stock: 20 },
        { size: 'L', color: 'Indigo Blue', stock: 10 },
        { size: 'XL', color: 'Indigo Blue', stock: 12 },
        { size: 'XXL', color: 'Indigo Blue', stock: 5 },
      ]
    },
    {
      title: 'Peach Mulmul Short Kurti',
      slug: 'peach-mulmul-short-kurti',
      description: 'Super-soft peach mulmul cotton short kurta. Completed with white lace details along the cuffs and neck, comfortable summer wear.',
      basePrice: 1899,
      discount: 5,
      images: '/images/peach-mulmul-cotton.png',
      category: 'Short Kurti',
      variants: [
        { size: 'S', color: 'Soft Peach', stock: 12 },
        { size: 'M', color: 'Soft Peach', stock: 14 },
        { size: 'L', color: 'Soft Peach', stock: 8 },
        { size: 'XL', color: 'Soft Peach', stock: 10 },
        { size: 'XXL', color: 'Soft Peach', stock: 4 },
      ]
    },
    {
      title: 'Mint Green Short Chikankari',
      slug: 'mint-green-short-chikankari',
      description: 'Lucknowi Chikankari short kurti in mint green georgette. Hand-embroidered floral motifs spread across the front panel.',
      basePrice: 2499,
      discount: 10,
      images: '/images/mint-green-chanderi.png',
      category: 'Short Kurti',
      variants: [
        { size: 'S', color: 'Mint Green', stock: 10 },
        { size: 'M', color: 'Mint Green', stock: 12 },
        { size: 'L', color: 'Mint Green', stock: 6 },
        { size: 'XL', color: 'Mint Green', stock: 8 },
        { size: 'XXL', color: 'Mint Green', stock: 3 },
      ]
    },
    {
      title: 'Ruby Red Short Georgette',
      slug: 'ruby-red-short-georgette',
      description: 'Short georgette kurti in deep ruby red. Modern design with detailed neckline mirror accents, perfect for semi-formal meetings.',
      basePrice: 2299,
      discount: 12,
      images: '/images/ruby-red-straight.png',
      category: 'Short Kurti',
      variants: [
        { size: 'S', color: 'Ruby Red', stock: 9 },
        { size: 'M', color: 'Ruby Red', stock: 11 },
        { size: 'L', color: 'Ruby Red', stock: 7 },
        { size: 'XL', color: 'Ruby Red', stock: 5 },
        { size: 'XXL', color: 'Ruby Red', stock: 2 },
      ]
    },
    {
      title: 'Mustard Yellow Short Anarkali',
      slug: 'mustard-yellow-short-anarkali',
      description: 'Short length flared mustard yellow kurta. Brings a heavy flared look in a comfortable shorter silhouette.',
      basePrice: 2199,
      discount: 8,
      images: '/images/mustard-anarkali.png',
      category: 'Short Kurti',
      variants: [
        { size: 'S', color: 'Mustard Gold', stock: 11 },
        { size: 'M', color: 'Mustard Gold', stock: 14 },
        { size: 'L', color: 'Mustard Gold', stock: 8 },
        { size: 'XL', color: 'Mustard Gold', stock: 6 },
        { size: 'XXL', color: 'Mustard Gold', stock: 4 },
      ]
    },

    // --- CATEGORY 8: Kaftan Style ---
    {
      title: 'Lavender Kaftan Silk Kurti',
      slug: 'lavender-kaftan-silk-kurti',
      description: 'A loose, flowing kaftan style kurta in lavender silk. Designed with side drawstrings to secure the waist and comfortable wide sleeves.',
      basePrice: 3299,
      discount: 10,
      images: '/images/lavender-purple-georgette.png',
      category: 'Kaftan Style',
      variants: [
        { size: 'S', color: 'Lavender Purple', stock: 10 },
        { size: 'M', color: 'Lavender Purple', stock: 15 },
        { size: 'L', color: 'Lavender Purple', stock: 8 },
        { size: 'XL', color: 'Lavender Purple', stock: 12 },
        { size: 'XXL', color: 'Lavender Purple', stock: 5 },
      ]
    },
    {
      title: 'Emerald Georgette Kaftan',
      slug: 'emerald-georgette-kaftan',
      description: 'Deep emerald green georgette kaftan. Elegant gold lace lining the borders, giving it an effortless luxury look.',
      basePrice: 3499,
      discount: 15,
      images: '/images/emerald-georgette-kurta.png',
      category: 'Kaftan Style',
      variants: [
        { size: 'S', color: 'Emerald Green', stock: 8 },
        { size: 'M', color: 'Emerald Green', stock: 11 },
        { size: 'L', color: 'Emerald Green', stock: 6 },
        { size: 'XL', color: 'Emerald Green', stock: 9 },
        { size: 'XXL', color: 'Emerald Green', stock: 3 },
      ]
    },
    {
      title: 'Pastel Pink Organza Kaftan',
      slug: 'pastel-pink-organza-kaftan',
      description: 'Pastel pink organza sheer kaftan with fine floral painted motifs. Pairs beautifully with silk trousers for evening tea parties.',
      basePrice: 3899,
      discount: 12,
      images: '/images/pastel-pink-anarkali.png',
      category: 'Kaftan Style',
      variants: [
        { size: 'S', color: 'Pastel Pink', stock: 6 },
        { size: 'M', color: 'Pastel Pink', stock: 10 },
        { size: 'L', color: 'Pastel Pink', stock: 8 },
        { size: 'XL', color: 'Pastel Pink', stock: 5 },
        { size: 'XXL', color: 'Pastel Pink', stock: 2 },
      ]
    },
    {
      title: 'Peach Cotton Kaftan Kurta',
      slug: 'peach-cotton-kaftan-kurta',
      description: 'Summer-friendly light cotton kaftan in soft peach. Features side tassels and dynamic daily comfort layout.',
      basePrice: 2899,
      discount: 10,
      images: '/images/peach-mulmul-cotton.png',
      category: 'Kaftan Style',
      variants: [
        { size: 'S', color: 'Soft Peach', stock: 12 },
        { size: 'M', color: 'Soft Peach', stock: 14 },
        { size: 'L', color: 'Soft Peach', stock: 9 },
        { size: 'XL', color: 'Soft Peach', stock: 7 },
        { size: 'XXL', color: 'Soft Peach', stock: 4 },
      ]
    },
    {
      title: 'Ruby Red Satin Kaftan',
      slug: 'ruby-red-satin-kaftan',
      description: 'Glossy red satin kaftan with beautiful drape and fall. Lined with silver embroidery borders, ideal for formal B2B events.',
      basePrice: 3999,
      discount: 5,
      images: '/images/ruby-red-straight.png',
      category: 'Kaftan Style',
      variants: [
        { size: 'S', color: 'Ruby Red', stock: 5 },
        { size: 'M', color: 'Ruby Red', stock: 8 },
        { size: 'L', color: 'Ruby Red', stock: 6 },
        { size: 'XL', color: 'Ruby Red', stock: 7 },
        { size: 'XXL', color: 'Ruby Red', stock: 1 },
      ]
    },

    // --- CATEGORY 9: Festive Velvet ---
    {
      title: 'Crimson Velvet Royal Kurta',
      slug: 'crimson-velvet-royal-kurta',
      description: 'Luxurious heavy weight velvet kurta in royal crimson. Elaborate gold zari borders along the neck, cuffs, and bottom hem.',
      basePrice: 5999,
      discount: 10,
      images: '/images/velvet-kurti.png',
      category: 'Festive Velvet',
      variants: [
        { size: 'S', color: 'Crimson Red', stock: 5 },
        { size: 'M', color: 'Crimson Red', stock: 8 },
        { size: 'L', color: 'Crimson Red', stock: 3 },
        { size: 'XL', color: 'Crimson Red', stock: 6 },
        { size: 'XXL', color: 'Crimson Red', stock: 2 },
      ]
    },
    {
      title: 'Emerald Green Velvet Kurta',
      slug: 'emerald-green-velvet-kurta',
      description: 'Emerald green velvet straight-cut kurta. Smooth, warm velvet material accented with copper zari thread work.',
      basePrice: 5899,
      discount: 8,
      images: '/images/emerald-kurta.png',
      category: 'Festive Velvet',
      variants: [
        { size: 'S', color: 'Emerald Green', stock: 6 },
        { size: 'M', color: 'Emerald Green', stock: 10 },
        { size: 'L', color: 'Emerald Green', stock: 4 },
        { size: 'XL', color: 'Emerald Green', stock: 8 },
        { size: 'XXL', color: 'Emerald Green', stock: 1 },
      ]
    },
    {
      title: 'Lavender Velvet Gota Kurti',
      slug: 'lavender-velvet-gota-kurti',
      description: 'Lavender velvet flared kurta decorated with silver gota-patti lines. Combines classic material with modern shade layout.',
      basePrice: 5699,
      discount: 10,
      images: '/images/lavender-purple-georgette.png',
      category: 'Festive Velvet',
      variants: [
        { size: 'S', color: 'Lavender Purple', stock: 7 },
        { size: 'M', color: 'Lavender Purple', stock: 9 },
        { size: 'L', color: 'Lavender Purple', stock: 5 },
        { size: 'XL', color: 'Lavender Purple', stock: 7 },
        { size: 'XXL', color: 'Lavender Purple', stock: 3 },
      ]
    },
    {
      title: 'Deep Ruby Velvet Straight Kurta',
      slug: 'deep-ruby-velvet-straight-kurta',
      description: 'Straight-cut velvet kurta in ruby red. Features a minimal band collar and side slit designs, providing a premium formal outline.',
      basePrice: 5799,
      discount: 5,
      images: '/images/ruby-red-straight.png',
      category: 'Festive Velvet',
      variants: [
        { size: 'S', color: 'Ruby Red', stock: 8 },
        { size: 'M', color: 'Ruby Red', stock: 11 },
        { size: 'L', color: 'Ruby Red', stock: 6 },
        { size: 'XL', color: 'Ruby Red', stock: 5 },
        { size: 'XXL', color: 'Ruby Red', stock: 0 },
      ]
    },
    {
      title: 'Midnight Blue Velvet Kurta',
      slug: 'midnight-blue-velvet-kurta',
      description: 'Gorgeously dyed velvet kurta in dark midnight blue. Finished with high quality inner lining and gold patch pockets.',
      basePrice: 6299,
      discount: 12,
      images: '/images/indigo-cotton-kurta.png',
      category: 'Festive Velvet',
      variants: [
        { size: 'S', color: 'Midnight Blue', stock: 5 },
        { size: 'M', color: 'Midnight Blue', stock: 8 },
        { size: 'L', color: 'Midnight Blue', stock: 4 },
        { size: 'XL', color: 'Midnight Blue', stock: 7 },
        { size: 'XXL', color: 'Midnight Blue', stock: 2 },
      ]
    },

    // --- CATEGORY 10: Office Wear Cotton ---
    {
      title: 'Indigo Formal Cotton Kurta',
      slug: 'indigo-formal-cotton-kurta',
      description: 'Clean straight-cut cotton kurta dyed in organic indigo. Minimal print designs, highly breathable for long office hours.',
      basePrice: 2499,
      discount: 10,
      images: '/images/indigo-cotton-kurta.png',
      category: 'Office Wear Cotton',
      variants: [
        { size: 'S', color: 'Indigo Blue', stock: 15 },
        { size: 'M', color: 'Indigo Blue', stock: 18 },
        { size: 'L', color: 'Indigo Blue', stock: 10 },
        { size: 'XL', color: 'Indigo Blue', stock: 14 },
        { size: 'XXL', color: 'Indigo Blue', stock: 5 },
      ]
    },
    {
      title: 'Peach Mulmul Office Kurta',
      slug: 'peach-mulmul-office-kurta',
      description: 'Super-soft daily wear mulmul cotton kurta in peach. Minimal collar piping, perfect for clean professional ethnic look.',
      basePrice: 2299,
      discount: 5,
      images: '/images/peach-mulmul-cotton.png',
      category: 'Office Wear Cotton',
      variants: [
        { size: 'S', color: 'Soft Peach', stock: 12 },
        { size: 'M', color: 'Soft Peach', stock: 15 },
        { size: 'L', color: 'Soft Peach', stock: 8 },
        { size: 'XL', color: 'Soft Peach', stock: 11 },
        { size: 'XXL', color: 'Soft Peach', stock: 3 },
      ]
    },
    {
      title: 'Ivory White Chikankari Office Kurti',
      slug: 'ivory-white-chikankari-office-kurti',
      description: 'Elegant white cotton kurta with light front-panel Chikankari embroidery. Standard formal wear options for B2B buyers.',
      basePrice: 2799,
      discount: 8,
      images: '/images/ivory-white-chikankari.png',
      category: 'Office Wear Cotton',
      variants: [
        { size: 'S', color: 'Ivory White', stock: 10 },
        { size: 'M', color: 'Ivory White', stock: 12 },
        { size: 'L', color: 'Ivory White', stock: 6 },
        { size: 'XL', color: 'Ivory White', stock: 9 },
        { size: 'XXL', color: 'Ivory White', stock: 4 },
      ]
    },
    {
      title: 'Mint Green Cotton Straight Kurti',
      slug: 'mint-green-cotton-straight-kurti',
      description: 'Light mint green straight-cut cotton kurta. Lined with self-print checks and dynamic button design on neckline.',
      basePrice: 2399,
      discount: 10,
      images: '/images/mint-green-chanderi.png',
      category: 'Office Wear Cotton',
      variants: [
        { size: 'S', color: 'Mint Green', stock: 14 },
        { size: 'M', color: 'Mint Green', stock: 16 },
        { size: 'L', color: 'Mint Green', stock: 9 },
        { size: 'XL', color: 'Mint Green', stock: 11 },
        { size: 'XXL', color: 'Mint Green', stock: 5 },
      ]
    },
    {
      title: 'Lavender Daily Cotton Kurta',
      slug: 'lavender-daily-cotton-kurta',
      description: 'Soft combed cotton daily wear straight kurta in lavender purple. High quality color-fast fabric with comfort pockets.',
      basePrice: 2499,
      discount: 10,
      images: '/images/lavender-purple-georgette.png',
      category: 'Office Wear Cotton',
      variants: [
        { size: 'S', color: 'Lavender Purple', stock: 11 },
        { size: 'M', color: 'Lavender Purple', stock: 14 },
        { size: 'L', color: 'Lavender Purple', stock: 8 },
        { size: 'XL', color: 'Lavender Purple', stock: 10 },
        { size: 'XXL', color: 'Lavender Purple', stock: 3 },
      ]
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
      price: 3869.1,
      quantity: 2,
      size: 'M',
      color: 'Emerald',
    },
    {
      id: allProducts[1].id,
      title: allProducts[1].title,
      price: 3704.05,
      quantity: 1,
      size: 'L',
      color: 'Royal Blue',
    },
  ];

  const baseDate = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const ordersData = [
    {
      userId: customer.id,
      items: JSON.stringify(sampleItems),
      totalAmount: 11442.25,
      gstAmount: 572.11,
      gstin: '07AAAAA1111A1Z1',
      companyName: 'Chic Boutique India',
      paymentStatus: 'PAID',
      deliveryStatus: 'DELIVERED',
      createdAt: new Date(baseDate.getTime() - 4 * dayMs),
    },
    {
      userId: customer.id,
      items: JSON.stringify(sampleItems),
      totalAmount: 11442.25,
      gstAmount: 572.11,
      gstin: null,
      companyName: null,
      paymentStatus: 'PAID',
      deliveryStatus: 'SHIPPED',
      createdAt: new Date(baseDate.getTime() - 2 * dayMs),
    },
    {
      userId: customer.id,
      items: JSON.stringify(sampleItems),
      totalAmount: 11442.25,
      gstAmount: 572.11,
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

  console.log('Seeded initial orders history.');
  console.log('🎉 Expanded Database seeding operation completed without errors!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
