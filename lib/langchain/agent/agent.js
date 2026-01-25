/**
 * M.K. Jewellers AI Agent
 * 
 * This is the main agent implementation using LangChain's ReAct pattern.
 * The agent can reason about user queries and use tools to provide accurate responses.
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
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

        // Initialize the LLM (Gemini 1.5 Flash - Higher free tier limit)
        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            temperature: 0.7,
            maxRetries: 2,
        });

        // Get all registered tools
        const tools = getAllTools();

        if (tools.length === 0) {
            console.warn("⚠️ [Agent] No tools registered. Agent will have limited capabilities.");
        } else {
            console.log(`🔧 [Agent] Loaded ${tools.length} tools:`, tools.map(t => t.name).join(", "));
        }

        // Create ReAct agent with tools
        const agent = createReactAgent({
            llm,
            tools,
            messageModifier: AGENT_SYSTEM_PROMPT,
        });

        console.log("✅ [Agent] Agent initialized successfully");
        return agent;

    } catch (error) {
        console.error("❌ [Agent] Initialization failed:", error);
        throw error;
    }
}

/**
 * Execute the agent with a user message
 * @param {string} conversationId - Unique conversation identifier
 * @param {string} userMessage - User's message
 * @returns {Promise<Object>} Agent response with content and metadata
 */
export async function executeAgent(conversationId, userMessage) {
    try {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`🤖 [Agent] NEW QUERY`);
        console.log(`📝 User Query: "${userMessage}"`);
        console.log(`🔑 Conversation ID: ${conversationId}`);
        console.log(`${'='.repeat(80)}\n`);

        // Initialize agent
        const agent = await initializeAgent();

        // Get or create conversation history
        let history = conversationMemory.get(conversationId) || [];

        // Build message history for the agent
        const messages = [
            ...history,
            new HumanMessage(userMessage)
        ];

        // Execute agent
        console.log(`🔄 [Agent] Executing agent with ${messages.length} messages in history`);
        const startTime = Date.now();

        const result = await agent.invoke({
            messages: messages
        });

        const executionTime = Date.now() - startTime;

        // Extract the final response
        const agentMessages = result.messages || [];
        const lastMessage = agentMessages[agentMessages.length - 1];
        const responseContent = lastMessage?.content || "I apologize, but I couldn't generate a response.";

        // Update conversation history
        history.push(new HumanMessage(userMessage));
        history.push(new AIMessage(responseContent));

        // Keep only last 10 messages (5 exchanges) to manage memory
        if (history.length > 10) {
            history = history.slice(-10);
        }

        conversationMemory.set(conversationId, history);

        // Extract detailed metadata about tools used
        const toolCalls = [];
        const toolMessages = [];

        agentMessages.forEach((msg, idx) => {
            // Check for tool calls in AI messages
            if (msg.additional_kwargs?.tool_calls) {
                msg.additional_kwargs.tool_calls.forEach(tc => {
                    toolCalls.push({
                        name: tc.function?.name,
                        arguments: tc.function?.arguments,
                        id: tc.id
                    });
                });
            }

            // Check for tool response messages
            if (msg.constructor.name === 'ToolMessage') {
                toolMessages.push({
                    toolName: msg.name,
                    content: msg.content,
                    toolCallId: msg.tool_call_id
                });
            }
        });

        const toolsUsed = [...new Set(toolCalls.map(tc => tc.name).filter(Boolean))];

        // Enhanced logging
        console.log(`\n${'─'.repeat(80)}`);
        console.log(`📊 [Agent] EXECUTION SUMMARY`);
        console.log(`${'─'.repeat(80)}`);
        console.log(`⏱️  Execution Time: ${executionTime}ms`);
        console.log(`🔧 Tools Called: ${toolsUsed.length > 0 ? toolsUsed.join(", ") : "❌ None"}`);

        if (toolCalls.length > 0) {
            console.log(`\n📋 Tool Call Details:`);
            toolCalls.forEach((tc, idx) => {
                console.log(`   ${idx + 1}. 🔧 ${tc.name}`);
                try {
                    const args = JSON.parse(tc.arguments);
                    console.log(`      📥 Input:`, JSON.stringify(args, null, 2).split('\n').map((line, i) => i === 0 ? line : `         ${line}`).join('\n'));
                } catch (e) {
                    console.log(`      📥 Input: ${tc.arguments}`);
                }
            });

            if (toolMessages.length > 0) {
                console.log(`\n📤 Tool Responses:`);
                toolMessages.forEach((tm, idx) => {
                    console.log(`   ${idx + 1}. ✅ ${tm.toolName}`);
                    try {
                        const output = JSON.parse(tm.content);
                        if (output.found !== undefined) {
                            console.log(`      📊 Found: ${output.found ? '✅ Yes' : '❌ No'}`);
                        }
                        if (output.count !== undefined) {
                            console.log(`      📊 Count: ${output.count}`);
                        }
                        if (output.message) {
                            console.log(`      💬 Message: ${output.message}`);
                        }
                    } catch (e) {
                        console.log(`      📤 Output: ${tm.content.substring(0, 100)}...`);
                    }
                });
            }
        }

        console.log(`\n💬 Agent Response Preview: "${responseContent.substring(0, 100)}${responseContent.length > 100 ? '...' : ''}"`);
        console.log(`${'='.repeat(80)}\n`);

        return {
            content: responseContent,
            toolsUsed,
            messageCount: history.length,
            rawMessages: agentMessages,
            executionTime,
            toolCallDetails: toolCalls, // Add detailed tool call info
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
