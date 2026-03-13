
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("=== CATEGORIES ===");
    const categories = await prisma.category.findMany({
      where: { deletedAt: null },
      select: { name: true, slug: true, id: true }
    });
    console.log(JSON.stringify(categories, null, 2));

    console.log("\n=== SUB-CATEGORIES ===");
    const subCategories = await prisma.subCategory.findMany({
      where: { deletedAt: null },
      select: { name: true, slug: true, id: true }
    });
    console.log(JSON.stringify(subCategories, null, 2));

    console.log("\n=== METAL RATES ===");
    const rates = await prisma.metalRate.findMany();
    console.log(JSON.stringify(rates, null, 2));

    console.log("\n=== SAMPLES PRODUCTS (10) ===");
    const products = await prisma.product.findMany({
      take: 10,
      where: { deletedAt: null },
      include: {
        category: true,
        subCategory: true,
        variants: true
      }
    });

    products.forEach(p => {
        console.log(`- ${p.name} | Cat: ${p.category?.name} | Sub: ${p.subCategory?.name} | Variants: ${p.variants.length}`);
    });

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
