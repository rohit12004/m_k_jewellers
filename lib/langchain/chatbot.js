import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { getRelevantContext } from "./vectorStore.js";

/**
 * Chatbot Logic for M.K. Jewellers
 * 
 * This module provides a simple RAG-based chatbot that can answer
 * questions about store policies, jewelry care, and general information
 * using the pre-initialized vector store.
 */

// Initialize Native Google Generative AI
const getModel = () => {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
        console.error("❌ [Chatbot] GOOGLE_API_KEY is not configured");
        return null;
    }

    return new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash",
        apiKey: apiKey,
    });
};

/**
 * Get a response from the chatbot
 * 
 * @param {string} userMessage - User's question
 * @param {Array} history - Previous message history
 * @returns {Promise<string>} - AI generated response
 */
export async function getChatResponse(userMessage, history = []) {
    try {
        console.log(`🤖 [Chatbot] Processing message: "${userMessage}"`);

        const model = getModel();
        if (!model) {
            return "I'm sorry, my AI service is currently unavailable. Please contact the store directly.";
        }

        // 🔄 RETRY LOGIC: Handle 429 (Rate Limit) errors with backoff
        const invokeWithRetry = async (targetModel, targetMessages, retries = 3, delay = 2000) => {
            try {
                return await targetModel.invoke(targetMessages);
            } catch (error) {
                if ((error.message?.includes("429") || error.status === 429) && retries > 0) {
                    console.warn(`⏳ [Chatbot] Rate limit hit (429). Retrying in ${delay}ms... (${retries} attempts left)`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return await invokeWithRetry(targetModel, targetMessages, retries - 1, delay * 2);
                }
                throw error;
            }
        };

        // Search knowledge base for relevant context
        console.log("🔍 [Chatbot] Retrieving relevant context from vector store...");
        const context = await getRelevantContext(userMessage);

        // Build system prompt with context
        const systemPrompt = `You are a helpful and elegant assistant for M.K. Jewellers, a premium jewelry retailer.
Use the provided store information to answer customer questions accurately.
If the information is not in the context, be honest and suggest they contact our store.

STORE INFORMATION:
${context}

Instructions:
- Be warm, professional, and sophisticated.
- Keep responses concise and helpful.
- For product-specific availability or prices not listed, encourage visiting the store.`;

        // Convert history to LangChain messages if they aren't already
        const formattedHistory = history.map(msg => {
            if (msg._getType) return msg; // Already a LangChain message
            if (msg.role === 'user') return new HumanMessage(msg.content);
            if (msg.role === 'assistant') return new AIMessage(msg.content);
            return new HumanMessage(msg.content); // Default
        });

        // Build messages
        const messages = [
            new SystemMessage(systemPrompt),
            ...formattedHistory,
            new HumanMessage(userMessage)
        ];

        // Generate response
        console.log("🔄 [Chatbot] Generating response via Native SDK...");
        const response = await invokeWithRetry(model, messages);

        console.log("✅ [Chatbot] Response generated successfully");
        return response.content;

    } catch (error) {
        console.error("❌ [Chatbot] Error generating response:", error);
        throw error;
    }
}

