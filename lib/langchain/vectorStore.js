import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { storeKnowledge } from "./knowledge/store-info.js";

/**
 * Vector Store for Store Knowledge Base
 * 
 * This module initializes a MemoryVectorStore with store information
 * and provides semantic search capabilities for the chatbot.
 * 
 * The vector store is initialized once on server startup and reused
 * for all subsequent requests, making it very efficient.
 */

// Global variable to store the initialized vector store
let vectorStore = null;
let isInitializing = false;

/**
 * Initialize the vector store with store knowledge
 * This is called once on server startup
 */
export async function initializeVectorStore() {
    // Return existing store if already initialized
    if (vectorStore) {
        console.log("✅ [VectorStore] Already initialized, returning existing store");
        return vectorStore;
    }

    // Prevent multiple simultaneous initializations
    if (isInitializing) {
        console.log("⏳ [VectorStore] Initialization in progress, waiting...");
        // Wait for initialization to complete
        while (isInitializing) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return vectorStore;
    }

    try {
        isInitializing = true;
        console.log("🚀 [VectorStore] Starting initialization...");

        // Check if API key exists
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey || apiKey.trim() === '') {
            throw new Error("GOOGLE_API_KEY is not configured");
        }

        // Initialize embeddings model
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: apiKey,
            modelName: "text-embedding-004", // Latest Gemini embedding model
        });

        console.log(`📚 [VectorStore] Creating embeddings for ${storeKnowledge.length} knowledge chunks...`);

        // Extract content and metadata from store knowledge
        const documents = storeKnowledge.map(item => item.content);
        const metadatas = storeKnowledge.map(item => ({
            category: item.category,
            title: item.title,
        }));

        // Create vector store from documents
        vectorStore = await MemoryVectorStore.fromTexts(
            documents,
            metadatas,
            embeddings
        );

        console.log("✅ [VectorStore] Initialization complete!");
        console.log(`📊 [VectorStore] Loaded ${storeKnowledge.length} knowledge chunks into memory`);

        return vectorStore;

    } catch (error) {
        console.error("❌ [VectorStore] Initialization failed:", error);
        vectorStore = null; // Reset on error
        throw error;
    } finally {
        isInitializing = false;
    }
}

/**
 * Search the knowledge base for relevant information
 * 
 * @param {string} query - User's question
 * @param {number} k - Number of results to return (default: 2)
 * @returns {Promise<Array>} - Array of relevant documents
 */
export async function searchKnowledge(query, k = 2) {
    try {
        // Initialize vector store if not already done
        if (!vectorStore) {
            console.log("🔄 [VectorStore] Not initialized, initializing now...");
            await initializeVectorStore();
        }

        console.log(`🔍 [VectorStore] Searching for: "${query}"`);

        // Perform similarity search
        const results = await vectorStore.similaritySearch(query, k);

        console.log(`✅ [VectorStore] Found ${results.length} relevant chunks`);

        // Log what was found (for debugging)
        results.forEach((doc, idx) => {
            console.log(`   ${idx + 1}. [${doc.metadata.category}] ${doc.metadata.title}`);
        });

        return results;

    } catch (error) {
        console.error("❌ [VectorStore] Search failed:", error);
        throw error;
    }
}

/**
 * Get formatted context from search results
 * Combines multiple search results into a single context string
 * 
 * @param {string} query - User's question
 * @param {number} k - Number of results to retrieve
 * @returns {Promise<string>} - Formatted context string
 */
export async function getRelevantContext(query, k = 2) {
    try {
        const results = await searchKnowledge(query, k);

        if (results.length === 0) {
            return "No specific information found in our knowledge base.";
        }

        // Format results into a context string
        const context = results
            .map((doc, idx) => {
                return `[${doc.metadata.category.toUpperCase()}] ${doc.metadata.title}:\n${doc.pageContent}`;
            })
            .join('\n\n---\n\n');

        return context;

    } catch (error) {
        console.error("❌ [VectorStore] Failed to get context:", error);
        return "Unable to retrieve store information at this time.";
    }
}

/**
 * Manually trigger vector store initialization
 * Useful for warming up the server
 */
export async function warmupVectorStore() {
    console.log("🔥 [VectorStore] Warming up vector store...");
    await initializeVectorStore();
    console.log("✅ [VectorStore] Warmup complete");
}

// Export the vector store instance (for advanced use cases)
export function getVectorStore() {
    return vectorStore;
}
