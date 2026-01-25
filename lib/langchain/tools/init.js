/**
 * Tools Initialization
 * 
 * This file registers all available tools for the AI agent.
 * Import and register new tools here to make them available to the agent.
 */

import { registerTool } from "./index.js";
import { knowledgeSearchTool } from "./knowledge-search.js";
import { productSearchTool } from "./product-search.js";
import { categoryLookupTool } from "./category-lookup.js";
import { productDetailsTool } from "./product-details.js";

/**
 * Initialize and register all tools
 * Call this function before creating the agent
 */
export function initializeTools() {
    console.log("🔧 [Tools] Initializing all tools...");

    // Register all tools
    registerTool("knowledge_search", knowledgeSearchTool);
    registerTool("product_search", productSearchTool);
    registerTool("category_lookup", categoryLookupTool);
    registerTool("product_details", productDetailsTool);

    console.log("✅ [Tools] All tools initialized successfully");
}

// Auto-initialize tools when this module is imported
initializeTools();
