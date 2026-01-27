import { executeAgent } from "@/lib/langchain/agent/agent.js";
import "@/lib/langchain/tools/init.js"; // Initialize tools
import { response, catchError } from "@/lib/helperFunction";

export async function POST(request) {
    try {
        const { message, conversationId } = await request.json();

        if (!message) {
            return response(false, 400, "Message is required");
        }

        // Get or create conversation ID
        const convId = conversationId || crypto.randomUUID();

        console.log("\n📨 [CHATBOT API] Incoming Request");
        console.log(`   Query: "${message}"`);
        console.log(`   Conversation ID: ${convId}`);

        // Execute AI agent with tools
        const agentResponse = await executeAgent(convId, message);

        // Extract products from agent response if any
        const products = extractProductsFromResponse(agentResponse);

        // Debug summary
        console.log("\n✅ [CHATBOT API] Response Ready");
        console.log(`   Tools Used: ${agentResponse.toolsUsed.length > 0 ? agentResponse.toolsUsed.join(", ") : "None"}`);
        console.log(`   Products Found: ${products.length}`);
        console.log(`   Execution Time: ${agentResponse.executionTime}ms`);
        console.log(`   Response Length: ${agentResponse.content.length} chars\n`);

        return response(true, 200, "Response generated", {
            reply: agentResponse.content,
            conversationId: convId,
            products: products,
            toolsUsed: agentResponse.toolsUsed,
            metadata: {
                messageCount: agentResponse.messageCount,
                hasProducts: products.length > 0,
                executionTime: agentResponse.executionTime
            }
        });

    } catch (error) {
        console.error("❌ [CHATBOT API] Full error:", error);
        console.error("❌ [CHATBOT API] Error message:", error.message);
        console.error("❌ [CHATBOT API] Error name:", error.name);

        // Check if it's a configuration error
        if (error.message && (error.message.includes("not configured") || error.message.includes("API key"))) {
            return response(false, 503, "Chatbot is not configured. Please contact support.", {
                error: "API_KEY_MISSING"
            });
        }

        return response(false, 500, error.message || "An error occurred. Please try again.");
    }
}

/**
 * Extract product data from agent response
 * Looks for JSON product data in the agent's tool outputs
 */
function extractProductsFromResponse(agentResponse) {
    try {
        const products = [];

        // Check if product_search or product_details tools were used
        if (!agentResponse.toolsUsed || agentResponse.toolsUsed.length === 0) {
            return products;
        }

        // Check if we have direct tool results (added in recent update)
        if (agentResponse.toolResults && Array.isArray(agentResponse.toolResults)) {
            for (const resultStr of agentResponse.toolResults) {
                try {
                    // Tool results are strings of JSON
                    if (typeof resultStr === 'string' && (resultStr.includes('"products"') || resultStr.includes('"product"'))) {
                        const parsed = JSON.parse(resultStr);

                        // Case 1: Search returned a list of products
                        if (parsed.products && Array.isArray(parsed.products)) {
                            products.push(...parsed.products);
                        }
                        // Case 2: Details returned a single product
                        else if (parsed.product && parsed.found) {
                            // Convert single product to array format
                            products.push({
                                id: parsed.product.id,
                                name: parsed.product.name,
                                slug: parsed.product.slug,
                                description: parsed.product.description,
                                category: parsed.product.category.name,
                                price: parsed.product.priceRange?.min || parsed.product.price || 0,
                                image: parsed.product.images?.[0]?.url || parsed.product.image || null,
                                productUrl: parsed.product.productUrl
                            });
                        }
                    }
                } catch (e) {
                    console.warn("Failed to parse tool result:", e.message);
                }
            }
        }

        // Fallback: Parse raw messages (legacy support)
        if (products.length === 0) {
            const rawMessages = agentResponse.rawMessages || [];
            // ... (keep existing rawMessages logic or just return products if empty)
        }

        return products;
    } catch (error) {
        console.error("❌ [CHATBOT API] Error extracting products:", error);
        return [];
    }
}
