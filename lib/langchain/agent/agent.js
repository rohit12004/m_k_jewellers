/**
 * M.K. Jewellers AI Agent
 * 
 * This is the main agent implementation using LangChain's ReAct pattern.
 * The agent can reason about user queries and use tools to provide accurate responses.
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { AGENT_SYSTEM_PROMPT } from "./prompts.js";
import { getAllTools } from "../tools/index.js";

/**
 * Store conversation histories in memory
 * Key: conversationId, Value: array of messages
 */
const conversationMemory = new Map();

/**
 * Initialize the AI agent with tools
 * @returns {Promise<Object>} Agent executor
 */
export async function initializeAgent() {
    try {
        // Check if API key exists
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey || apiKey.trim() === '') {
            throw new Error("GOOGLE_API_KEY is not configured");
        }

        // Initialize the LLM (Gemini 2.5 Flash - Optimized for function calling)
        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            temperature: 0.1, // Lower temperature for more deterministic tool calling
            maxRetries: 2,
        });

        // Get all registered tools
        const tools = getAllTools();

        if (tools.length === 0) {
            console.warn("⚠️ [Agent] No tools registered. Agent will have limited capabilities.");
        } else {
            console.log(`🔧 [Agent] Loaded ${tools.length} tools:`, tools.map(t => t.name).join(", "));
        }

        // CRITICAL FIX: Bind tools directly to the model
        // This is the proper way to enable function calling with Gemini
        const llmWithTools = llm.bindTools(tools, {
            tool_choice: "auto" // Let model decide when to use tools
        });

        console.log("✅ [Agent] LLM initialized with tools bound");

        // Return both the base LLM and the tool-enabled version
        return {
            llm: llmWithTools,
            baseLlm: llm,
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
        console.log(`🤖 [Agent] NEW QUERY`);
        console.log(`📝 User Query: "${userMessage}"`);
        console.log(`🔑 Conversation ID: ${conversationId}`);
        console.log(`${'='.repeat(80)}\n`);

        // Initialize agent
        const { llm, baseLlm, tools } = await initializeAgent();

        // Get or create conversation history
        let history = conversationMemory.get(conversationId) || [];

        // Build messages with system prompt
        const messages = [
            {
                role: "system",
                content: AGENT_SYSTEM_PROMPT
            },
            ...history.map(msg => ({
                role: msg.role || (msg._getType() === 'human' ? 'user' : 'assistant'),
                content: msg.content
            })),
            {
                role: "user",
                content: userMessage
            }
        ];

        // Execute LLM with tools
        console.log(`🔄 [Agent] Invoking LLM with ${messages.length} messages`);
        const startTime = Date.now();

        const response = await llm.invoke(messages);

        const executionTime = Date.now() - startTime;

        // Check if tools were called
        const toolCalls = response.tool_calls || response.additional_kwargs?.tool_calls || [];
        const toolsUsed = [];
        const collectedToolResults = [];
        let finalContent = response.content;

        console.log(`\n📊 [Agent] Response received`);
        console.log(`   Tool calls detected: ${toolCalls.length}`);

        // If tools were called, execute them
        if (toolCalls.length > 0) {
            console.log(`\n🔧 [Agent] Executing ${toolCalls.length} tool call(s)...`);

            const toolMessages = [];
            
            for (const toolCall of toolCalls) {
                const toolName = toolCall.name || toolCall.function?.name;
                const toolArgs = typeof toolCall.args === 'string'
                    ? JSON.parse(toolCall.args)
                    : (toolCall.args || JSON.parse(toolCall.function?.arguments || '{}'));

                console.log(`   🔨 Calling tool: ${toolName}`);
                console.log(`      Args:`, toolArgs);

                toolsUsed.push(toolName);

                // Find and execute the tool
                const tool = tools.find(t => t.name === toolName);
                if (tool) {
                    try {
                        const toolResult = await tool.func(toolArgs);
                        collectedToolResults.push(toolResult); // Capture result for API response
                        console.log(`      ✅ Tool executed successfully`);

                        toolMessages.push({
                            role: "tool",
                            content: toolResult,
                            tool_call_id: toolCall.id || toolName
                        });
                    } catch (toolError) {
                        console.error(`      ❌ Tool execution failed:`, toolError.message);
                        toolMessages.push({
                            role: "tool",
                            content: `Error executing tool ${toolName}: ${toolError.message}`,
                            tool_call_id: toolCall.id || toolName
                        });
                    }
                } else {
                    console.warn(`      ⚠️  Tool "${toolName}" not found in registry`);
                    toolMessages.push({
                        role: "tool",
                        content: `Error: Tool "${toolName}" not found.`,
                        tool_call_id: toolCall.id || toolName
                    });
                }
            }

            // After all tools are executed, send results back to LLM to get final message
            if (toolMessages.length > 0) {
                const messagesWithToolResults = [
                    ...messages,
                    {
                        role: "assistant",
                        content: response.content || "",
                        tool_calls: toolCalls
                    },
                    ...toolMessages
                ];

                const finalResponse = await baseLlm.invoke(messagesWithToolResults);
                finalContent = finalResponse.content;
            }
        } else {
            console.log(`   ℹ️  No tools were called - using direct response`);
        }

        // Update conversation history
        history.push(new HumanMessage(userMessage));
        history.push(new AIMessage(finalContent));

        // Keep only last 10 messages (5 exchanges)
        if (history.length > 10) {
            history = history.slice(-10);
        }

        conversationMemory.set(conversationId, history);

        // Enhanced logging
        console.log(`\n${'─'.repeat(80)}`);
        console.log(`📊 [Agent] EXECUTION SUMMARY`);
        console.log(`${'─'.repeat(80)}`);
        console.log(`⏱️  Execution Time: ${executionTime}ms`);
        console.log(`🔧 Tools Called: ${toolsUsed.length > 0 ? toolsUsed.join(", ") : "❌ None"}`);
        console.log(`💬 Response Length: ${finalContent.length} chars`);
        console.log(`${'='.repeat(80)}\n`);

        return {
            content: finalContent,
            toolsUsed,
            messageCount: history.length,
            rawMessages: [response],
            executionTime,
            toolCallDetails: toolCalls,
            toolResults: collectedToolResults // Return raw tool outputs for UI to parse
        };

    } catch (error) {
        console.error("❌ [Agent] Execution failed:", error);
        throw error;
    }
}

/**
 * Clear conversation history for a specific conversation
 * @param {string} conversationId - Conversation ID to clear
 */
export function clearConversation(conversationId) {
    conversationMemory.delete(conversationId);
    console.log(`🗑️ [Agent] Cleared conversation: ${conversationId}`);
}

/**
 * Get conversation history
 * @param {string} conversationId - Conversation ID
 * @returns {Array} Message history
 */
export function getConversationHistory(conversationId) {
    return conversationMemory.get(conversationId) || [];
}

/**
 * Get all active conversation IDs
 * @returns {Array<string>}
 */
export function getActiveConversations() {
    return Array.from(conversationMemory.keys());
}
