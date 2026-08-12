const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const total = await prisma.product.count();
  const withHub = await prisma.product.count({ where: { hubLocation: { not: null } } });
  const sampleNullHub = await prisma.product.findMany({
    where: { hubLocation: null },
    take: 10,
    select: { id: true, title: true, category: true, description: true },
  });

  console.log('====================================');
  console.log('TOTAL PRODUCTS:', total);
  console.log('PRODUCTS WITH HUB LOCATION:', withHub);
  console.log('PRODUCTS MISSING HUB LOCATION:', total - withHub);
  console.log('====================================');
  console.log('SAMPLE NULL HUB PRODUCTS:');
  console.log(JSON.stringify(sampleNullHub, null, 2));
}

main().finally(() => prisma.$disconnect());
