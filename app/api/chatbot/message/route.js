import { generateChatResponse } from "@/lib/langchain/chatbot";
import { response, catchError } from "@/lib/helperFunction";

export async function POST(request) {
    try {
        const { message, conversationId } = await request.json();

        if (!message) {
            return response(false, 400, "Message is required");
        }

        // Get or create conversation ID
        const convId = conversationId || crypto.randomUUID();

        console.log("📨 [CHATBOT API] Received message:", message);
        console.log("🔑 [CHATBOT API] API Key exists:", !!process.env.GOOGLE_API_KEY);
        console.log("🔑 [CHATBOT API] API Key length:", process.env.GOOGLE_API_KEY?.length || 0);

        // Generate AI response
        const aiResponse = await generateChatResponse(convId, message);

        console.log("✅ [CHATBOT API] Response generated successfully");

        return response(true, 200, "Response generated", {
            reply: aiResponse,
            conversationId: convId,
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
