/**
 * Knowledge Search Tool
 * 
 * Searches the vector store for store information, policies, and general jewelry knowledge.
 * Use this for non-product questions like return policies, jewelry care, materials info, etc.
 */

import { createTool, z } from "./index.js";
import { getRelevantContext } from "../vectorStore.js";

/**
 * Knowledge Search Tool
 * Searches the store knowledge base using vector similarity search
 */
export const knowledgeSearchTool = createTool({
    name: "knowledge_search",
    description: `Search the store knowledge base for information about policies, jewelry care, materials, gemstones, or general store information. 
    
Use this tool when users ask about:
- Store policies (return, exchange, warranty, shipping)
- Jewelry care and maintenance
- Material information (gold, silver, diamonds, gemstones)
- General store information
- How to choose jewelry
- Sizing guides

Do NOT use this for searching products - use product_search instead.`,

    schema: z.object({
        query: z.string().describe("The search query for store information. Be specific and use keywords from the user's question.")
    }),

    func: async ({ query }) => {
        try {
            console.log(`🔍 [KnowledgeSearch] Searching for: "${query}"`);

            // Get relevant context from vector store (top 3 chunks)
            const context = await getRelevantContext(query, 3);

            if (!context || context.trim() === "" || context.includes("No specific information found")) {
                return JSON.stringify({
                    found: false,
                    message: "No specific information found in the knowledge base for this query. Suggest the customer contact the store directly for detailed information."
                });
            }

            console.log(`✅ [KnowledgeSearch] Found relevant information`);

            return JSON.stringify({
                found: true,
                information: context,
                message: "Successfully retrieved relevant information from the knowledge base."
            });

        } catch (error) {
            console.error(`❌ [KnowledgeSearch] Error:`, error);
            return JSON.stringify({
                found: false,
                error: error.message,
                message: "Failed to search knowledge base. Please try rephrasing the question."
            });
        }
    }
});
