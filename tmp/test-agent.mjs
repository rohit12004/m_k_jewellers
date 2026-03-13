
import { executeAgent } from '../lib/langchain/agent/agent.js';
import '../lib/langchain/tools/init.js';
import dotenv from 'dotenv';
dotenv.config();

async function test(query) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Testing query: "${query}"`);
    console.log(`${'='.repeat(50)}`);
    try {
        const response = await executeAgent("test-session-" + Math.random(), query);
        console.log("Response Content:", response.content);
        console.log("Tools Used:", response.toolsUsed);
        if (response.toolResults) {
            console.log("Tool Results Count:", response.toolResults.length);
        }
    } catch (e) {
        console.error("FAILED with error:", e);
    }
}

async function main() {
    // Rings
    await test("show me available rings");
    
    // Necklaces
    await test("show me available necklaces");
}

main();
