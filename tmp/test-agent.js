
const { executeAgent } = require('./lib/langchain/agent/agent.js');
require('./lib/langchain/tools/init.js');
require('dotenv').config();

async function test(query) {
    console.log(`\nTesting query: "${query}"`);
    try {
        const response = await executeAgent("test-session", query);
        console.log("Response Content:", response.content);
        console.log("Tools Used:", response.toolsUsed);
    } catch (e) {
        console.error("FAILED with error:", e);
    }
}

async function main() {
    // Rings usually work according to user
    await test("show me available rings");
    
    // Other products fail according to user
    await test("show me available necklaces");
    await test("do you have any gold chains?");
}

main();
