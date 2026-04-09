const { productSearchTool } = require('./lib/langchain/tools/product-search.js');

async function test() {
    console.log("--- Testing 'rings' (plural) ---");
    const res1 = await productSearchTool.func({ subCategory: "rings" });
    const parsed1 = JSON.parse(res1);
    console.log("Found:", parsed1.found, "Count:", parsed1.count);
    if (parsed1.products.length > 0) {
        console.log("Sample:", parsed1.products[0].name);
    }

    console.log("\n--- Testing 'Rings' (Capitalized) ---");
    const res2 = await productSearchTool.func({ subCategory: "Rings" });
    const parsed2 = JSON.parse(res2);
    console.log("Found:", parsed2.found, "Count:", parsed2.count);

    console.log("\n--- Testing 'earrings' ---");
    const res3 = await productSearchTool.func({ subCategory: "earrings" });
    const parsed3 = JSON.parse(res3);
    console.log("Found:", parsed3.found, "Count:", parsed3.count);
}

test().catch(console.error);
