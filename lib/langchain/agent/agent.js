import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { AGENT_SYSTEM_PROMPT, TOOL_SELECTION_GUIDANCE } from "./prompts.js";
import { getAllTools } from "../tools/index.js";

/**
 * Store conversation histories in memory
 * Key: conversationId, Value: array of messages
 */
const conversationMemory = new Map();

/**
 * Initialize the AI agent with tools
 * @returns {Promise<Object>} Generative AI model and tools
 */
export async function initializeAgent() {
    try {
        console.log("⚙️ [Agent] Initializing Native Google GenAI client...");
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey || apiKey.trim() === '') {
            throw new Error("GOOGLE_API_KEY is not configured");
        }

        // Initialize Native Google Generative AI
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            apiKey: apiKey,
        });

        // Get all registered tools
        console.log("🧰 [Agent] Fetching registered tools...");
        const tools = getAllTools();

        if (tools.length === 0) {
            console.warn("⚠️ [Agent] No tools registered. Agent will have limited capabilities.");
        } else {
            console.log(`🔧 [Agent] Loaded ${tools.length} tools:`, tools.map(t => t.name).join(", "));
        }

        // Bind tools to model
        const modelWithTools = model.bindTools(tools);

        console.log("✅ [Agent] Native SDK & tool binding complete");

        return {
            model,
            modelWithTools,
            tools
        };

    } catch (error) {
        console.error("❌ [Agent] Initialization failed:", error);
        throw error;
    }
}

export async function executeAgent(conversationId, userMessage) {
    try {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`🤖 [Agent] NEW QUERY (Native Google SDK)`);
        console.log(`📝 User Query: "${userMessage}"`);
        console.log(`🔑 Conversation ID: ${conversationId}`);
        console.log(`${'='.repeat(80)}\n`);

        // Initialize agent
        const { model, modelWithTools, tools } = await initializeAgent();

        // Get or create conversation history
        let history = conversationMemory.get(conversationId) || [];
        console.log(`📜 [Agent] Loaded history: ${history.length} messages`);

        // Build messages for Gemini
        const systemPrompt = `${AGENT_SYSTEM_PROMPT}\n\n${TOOL_SELECTION_GUIDANCE}`;
        const messages = [
            new SystemMessage(systemPrompt),
            ...history,
            new HumanMessage(userMessage)
        ];

        // Execute API call
        console.log(`🔄 [Agent] Calling Gemini via Native SDK...`);
        const startTime = Date.now();

        const response = await modelWithTools.invoke(messages);

        const executionTime = Date.now() - startTime;
        console.log(`✅ [Agent] Initial response received in ${executionTime}ms`);

        const toolsUsed = [];
        const collectedToolResults = [];
        let finalContent = response.content || "";

        // Handle tool calls
        if (response.tool_calls && response.tool_calls.length > 0) {
            const toolCalls = response.tool_calls;
            console.log(`🔧 [Agent] Model requested ${toolCalls.length} tool(s)...`);

            // Add assistant's tool call message to the list
            messages.push(response);

            const toolResults = await Promise.all(toolCalls.map(async (toolCall) => {
                const toolName = toolCall.name;
                let toolArgs = toolCall.args;

                // Fallback: If model sends empty arguments for search tools, use the original user message
                if ((toolName === 'knowledge_search' || toolName === 'product_search') && (!toolArgs.query || String(toolArgs.query).trim() === '')) {
                    console.warn(`⚠️ [Agent] Tool "${toolName}" called with empty query. Using user message as fallback.`);
                    toolArgs.query = userMessage;
                }

                console.log(`   🔨 Executing tool: ${toolName}`);
                toolsUsed.push(toolName);

                const tool = tools.find(t => t.name === toolName);
                if (!tool) {
                    console.error(`      ❌ Error: Tool "${toolName}" not found`);
                    return new ToolMessage({
                        tool_call_id: toolCall.id,
                        content: `Error: Tool "${toolName}" not found.`
                    });
                }

                try {
                    const result = await tool.func(toolArgs);
                    console.log(`      ✅ Tool success: ${toolName}`);
                    const toolContent = typeof result === 'string' ? result : JSON.stringify(result);
                    return new ToolMessage({
                        tool_call_id: toolCall.id,
                        content: toolContent
                    });
                } catch (error) {
                    console.error(`      ❌ Tool failed: ${toolName}:`, error.message);
                    return new ToolMessage({
                        tool_call_id: toolCall.id,
                        content: `Error executing ${toolName}: ${error.message}`
                    });
                }
            }));

            // Add tool results to messages
            messages.push(...toolResults);
            collectedToolResults.push(...toolResults.map(tr => tr.content));

            // Final step: Summarize results (use model without tools bound to force final answer)
            const finalStartTime = Date.now();
            const finalResponse = await model.invoke(messages);

            finalContent = finalResponse.content || "";
            console.log(`✅ [Agent] Final response generated in ${Date.now() - finalStartTime}ms`);
        } else {
            console.log("ℹ [Agent] Direct response - no tools needed");
        }

        // Ensure finalContent is a string
        const safeFinalContent = String(finalContent || "");

        // Update conversation history
        history.push(new HumanMessage(userMessage));
        history.push(new AIMessage(safeFinalContent));

        // Keep only last 10 messages
        if (history.length > 10) {
            history = history.slice(-10);
            console.log("🧹 [Agent] Trimmed history to 10 messages");
        }

        conversationMemory.set(conversationId, history);

        console.log(`\n🏁 [Agent] EXECUTION COMPLETE`);
        console.log(`   Time: ${executionTime}ms`);
        console.log(`   Tools: ${toolsUsed.length > 0 ? toolsUsed.join(", ") : "None"}`);
        console.log(`   Resp: "${safeFinalContent.substring(0, 50)}${safeFinalContent.length > 50 ? '...' : ''}"\n`);

        return {
            content: safeFinalContent,
            toolsUsed,
            toolResults: collectedToolResults, // Used by route.js for product extraction
            messageCount: history.length,
            executionTime,
            toolCallDetails: response.tool_calls || []
        };

    } catch (error) {
        console.error("❌ [Agent] Critical failure:", error);
        throw error;
    }
}

/**
 * Clear conversation history for a specific conversation
 */
export function clearConversation(conversationId) {
    conversationMemory.delete(conversationId);
}

/**
 * Get conversation history
 */
export function getConversationHistory(conversationId) {
    return conversationMemory.get(conversationId) || [];
}

/**
 * Get all active conversation IDs
 */
export function getActiveConversations() {
    return Array.from(conversationMemory.keys());
}
