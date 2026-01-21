import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getRelevantContext } from "./vectorStore.js";

// Store conversation history in memory
const conversations = new Map();


// Generate response with conversation memory and RAG
export async function generateChatResponse(conversationId, message) {
    // Check if API key exists
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
        throw new Error("Chatbot is not configured. Please add GOOGLE_API_KEY to your .env file.");
    }

    try {
        // Initialize model
        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            temperature: 0.7,
            maxRetries: 2,
        });

        // Get or create conversation history
        let history = conversations.get(conversationId) || [];

        // Build conversation context
        const historyText = history.length > 0
            ? history.map(msg => `${msg.role === 'user' ? 'Customer' : 'Assistant'}: ${msg.content}`).join('\n')
            : '';

        // 🔍 SMART CONTEXT RETRIEVAL - Only get relevant info
        console.log("🔍 [Chatbot] Retrieving relevant context for user query...");
        const relevantContext = await getRelevantContext(message, 2); // Get top 2 most relevant chunks

        // Create messages with dynamic context
        const messages = [
            [
                "system",
                `You are a helpful and elegant jewelry store assistant for MK Jewellers.

IMPORTANT STORE INFORMATION (use this to answer customer questions):
${relevantContext}

Your role:
- Help customers with their questions about our store, policies, products, and services
- Answer questions about jewelry, materials, gemstones, and care
- Provide accurate information based on the context provided above
- Be professional, warm, and knowledgeable
- If asked about something not in the context, politely say you don't have that specific information and suggest contacting the store directly

Keep responses concise, helpful, and sophisticated.

${historyText ? `Previous conversation:\n${historyText}\n` : ''}`
            ],
            ["human", message]
        ];

        // Invoke the model
        const aiMsg = await llm.invoke(messages);

        // Extract response content
        const response = aiMsg.content;

        // Update history
        history.push({ role: 'user', content: message });
        history.push({ role: 'assistant', content: response });

        // Keep only last 10 messages
        if (history.length > 10) {
            history = history.slice(-10);
        }

        conversations.set(conversationId, history);

        return response;
    } catch (error) {
        console.error("❌ [Chatbot] Error generating response:", error);
        throw error;
    }
}

