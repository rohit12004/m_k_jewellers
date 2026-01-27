
import dotenv from 'dotenv';
dotenv.config();

import { productSearchTool } from "./lib/langchain/tools/product-search.js";

async function verifyFix() {
    console.log("🧪 Verifying Product Search Tool Fix...");

    try {
        // Test case: Agent asks for "rings" as a category
        // Before fix: Returned 0 results (because 'rings' is a subcategory)
        // After fix: Should return products

        const input = { category: 'rings' };
        console.log(`\n🔍 Searching with input:`, input);

        const resultJson = await productSearchTool.func(input);
        const result = JSON.parse(resultJson);

        console.log(`\n📊 Result:`);
        console.log(`   Found: ${result.found}`);
        console.log(`   Count: ${result.count}`);

        if (result.found && result.count > 0) {
            console.log("✅ SUCCESS: Found products matching 'rings'!");
            result.products.forEach(p => {
                console.log(`   - ${p.name} (Cat: ${p.category}, SubCat: ${p.subCategory})`);
            });
        } else {
            console.log("❌ FAILURE: No products found.");
        }

    } catch (error) {
        console.error("❌ ERROR:", error);
    }
}

verifyFix();
