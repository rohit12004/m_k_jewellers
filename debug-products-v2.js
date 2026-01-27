
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("--- CATEGORIES ---");
        const categories = await prisma.category.findMany();
        console.log(JSON.stringify(categories, null, 2));

        console.log("\n--- SUBCATEGORIES ---");
        const subCategories = await prisma.subCategory.findMany();
        console.log(JSON.stringify(subCategories, null, 2));

        console.log("\n--- PRODUCTS ---");
        const products = await prisma.product.findMany({
            where: { deletedAt: null },
            include: {
                category: { select: { name: true, slug: true } },
                subCategory: { select: { name: true, slug: true } }
            }
        });
        console.log(JSON.stringify(products.map(p => ({
            name: p.name,
            slug: p.slug,
            category: p.category,
            subCategory: p.subCategory
        })), null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
