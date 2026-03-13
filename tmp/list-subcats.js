
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const subCats = await prisma.subCategory.findMany({
      where: { deletedAt: null },
      select: { name: true, slug: true }
    });
    console.log(JSON.stringify(subCats, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
