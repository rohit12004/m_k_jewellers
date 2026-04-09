import { executeAgent } from '../lib/langchain/agent/agent.js';
import '../lib/langchain/tools/init.js'; // Register tools
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    try {
        console.log("Testing executeAgent with query: 'where is the shop located?'");
        const response = await executeAgent("test-conv-123", "where is the shop located?");
        
        console.log("\n--- AGENT RESPONSE ---");
        console.log("Content:", response.content);
        console.log("Tools Used:", response.toolsUsed.join(", "));
        console.log("Execution Time:", response.executionTime, "ms");
        console.log("----------------------\n");

        if (response.content && response.content.length > 20 && response.toolsUsed.includes("knowledge_search")) {
            console.log("✅ Success! Agent called knowledge_search and returned a meaningful answer.");
        } else {
            console.log("❌ Failure or Weak Response.");
            if (!response.content) console.log("   - Content is EMPTY");
            if (!response.toolsUsed.includes("knowledge_search")) console.log("   - knowledge_search tool NOT called");
        }
    } catch (error) {
        console.error("❌ Test failed:", error);
    }
}

test();
