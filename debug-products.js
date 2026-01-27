
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("🔍 Checking Categories:");
        const categories = await prisma.category.findMany();
        console.table(categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })));

        console.log("\n🔍 Checking Products:");
        const products = await prisma.product.findMany({
            where: { deletedAt: null },
            include: { category: true }
        });

        products.forEach(p => {
            console.log(`- Product: "${p.name}" (Slug: ${p.slug})`);
            console.log(`  Category: ${p.category ? `${p.category.name} (${p.category.slug})` : 'NONE'}`);
            console.log(`  Price/Variants: ${p.variants ? 'Has variants' : 'No variants check'}`); // Schema might differ, just checking existence
        });

        if (products.length === 0) {
            console.log("❌ No active products found.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
