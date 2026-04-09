const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Simple singularizer and capitalizer
 */
function toTitleCase(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function singularize(str) {
    if (!str) return str;
    const lower = str.toLowerCase();
    let result = lower;
    if (lower.endsWith('ies')) result = lower.slice(0, -3) + 'y';
    else if (lower.endsWith('s') && !lower.endsWith('ss')) result = lower.slice(0, -1);
    return result;
}

async function main() {
    console.log("🚀 Starting Subcategory Singularization & Capitalization Migration...");

    // 1. Handle Necklace Merge
    console.log("\n--- Merging 'Necklaces' into 'Necklace' ---");
    const necklace = await prisma.subCategory.findFirst({ where: { slug: 'necklace' }});
    const necklaces = await prisma.subCategory.findFirst({ where: { slug: 'necklaces' }});

    if (necklace && necklaces && necklace.id !== necklaces.id) {
        console.log(`Found both 'necklace' and 'necklaces'. Merging into 'necklace'...`);
        
        await prisma.product.updateMany({
            where: { subCategoryId: necklaces.id },
            data: { subCategoryId: necklace.id }
        });

        await prisma.media.updateMany({
            where: { subCategoryId: necklaces.id },
            data: { subCategoryId: necklace.id }
        });

        const junctionEntries = await prisma.categorySubCategory.findMany({
            where: { subCategoryId: necklaces.id }
        });
        
        for (const entry of junctionEntries) {
            try {
                await prisma.categorySubCategory.upsert({
                    where: {
                        categoryId_subCategoryId: {
                            categoryId: entry.categoryId,
                            subCategoryId: necklace.id
                        }
                    },
                    update: {},
                    create: {
                        categoryId: entry.categoryId,
                        subCategoryId: necklace.id
                    }
                });
            } catch (e) { }
        }

        await prisma.categorySubCategory.deleteMany({ where: { subCategoryId: necklaces.id }});
        await prisma.subCategory.delete({ where: { id: necklaces.id }});
    }

    // 2. Standardize All
    console.log("\n--- Standardizing All Subcategories (Singular + Capitalized) ---");
    const subCats = await prisma.subCategory.findMany();

    for (const sub of subCats) {
        const singularName = singularize(sub.name);
        const newName = toTitleCase(singularName);
        const newSlug = singularize(sub.slug);

        if (newName !== sub.name || newSlug !== sub.slug) {
            console.log(`Updating '${sub.name}' (${sub.slug}) -> '${newName}' (${newSlug})`);
            try {
                await prisma.subCategory.update({
                    where: { id: sub.id },
                    data: {
                        name: newName,
                        slug: newSlug
                    }
                });
            } catch (error) {
                console.error(`Failed to update ${sub.name}: ${error.message}`);
            }
        }
    }

    console.log("\n✅ Migration Complete!");
}

main()
    .catch(e => {
        console.error("❌ Migration failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
