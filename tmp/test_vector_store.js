import { searchKnowledge } from '../lib/langchain/vectorStore.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    try {
        console.log("Testing searchKnowledge...");
        const results = await searchKnowledge("where is the shop located?");
        console.log("Search Results:", JSON.stringify(results, null, 2));
        if (results && results.length > 0) {
            console.log("✅ Initialization and search successful!");
        } else {
            console.log("❌ No results found.");
        }
    } catch (error) {
        console.error("❌ Test failed:", error);
    }
}

test();
