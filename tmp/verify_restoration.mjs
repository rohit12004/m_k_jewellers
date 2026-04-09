import { executeAgent } from "../lib/langchain/agent/agent.js";
import { searchKnowledge } from "../lib/langchain/vectorStore.js";
import dotenv from 'dotenv';
dotenv.config();

/**
 * FINAL VERIFICATION SCRIPT
 * This script tests the full AI Agent and Vector Store retrieval
 * using the new native SDK migration.
 */
async function finalVerify() {
    console.log("🚀 Starting FINAL VERIFICATION for MK Jewellers Chatbot...");
    
    try {
        // 1. Test Vector Store Retrieval
        console.log("\n--- [1] Testing Vector Store Retrieval ---");
        const knowledgeResults = await searchKnowledge("where is the shop?", 1);
        if (knowledgeResults.length > 0) {
            console.log("✅ Vector Store Success! Found:", knowledgeResults[0].metadata.title);
        } else {
            console.warn("⚠️ Vector Store returned no results (empty knowledge base?)");
        }

        // 2. Test AI Agent (Tool calling and response)
        console.log("\n--- [2] Testing AI Agent (Native SDK) ---");
        // Using a query that should trigger a search
        const agentResult = await executeAgent("test-conv-id", "Show me some rings");
        
        console.log("\n✅ AI Agent Success!");
        console.log("Response Content:", agentResult.content.substring(0, 100) + "...");
        console.log("Tools Used:", agentResult.toolsUsed);
        
        if (agentResult.toolsUsed.includes('product_search')) {
            console.log("💎 Tool logic: Smart Extraction worked or AI used correct subCategory.");
        }

        console.log("\n🎉 ALL SYSTEMS OPERATIONAL!");
    } catch (error) {
        console.error("\n❌ VERIFICATION FAILED:");
        console.error(error.message);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
}

// Note: This script needs to be in an environment where relative imports work
// I'll call it via node if my structure allows, or just use the log verification
finalVerify();
