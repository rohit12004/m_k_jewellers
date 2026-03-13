
import { executeAgent } from '../lib/langchain/agent/agent.js';
import '../lib/langchain/tools/init.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

async function runTest() {
    console.log("🚀 Starting verification...");
    
    const queries = [
        "show me available rings",
        "show me gold necklaces",
        "do you have any gold chains?"
    ];

    for (const query of queries) {
        console.log(`\n📝 Testing Query: "${query}"`);
        try {
            const result = await executeAgent("verify-session-" + Date.now(), query);
            console.log("✅ Success!");
            console.log("   Response Preview:", result.content.substring(0, 100) + "...");
            console.log("   Tools Used:", result.toolsUsed);
            console.log("   Products Found:", result.toolResults?.some(r => r.includes('"products"')) ? "Yes" : "No");
        } catch (error) {
            console.error("❌ Failed:", error.message);
        }
    }
}

runTest();
