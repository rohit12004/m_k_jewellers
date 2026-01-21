/**
 * Next.js Instrumentation Hook
 * 
 * This file is automatically called by Next.js when the server starts.
 * We use it to initialize the vector store embeddings on server startup,
 * ensuring the chatbot is ready before handling any requests.
 * 
 * Documentation: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
    // Only run on server-side
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.log('🚀 [INSTRUMENTATION] Server starting - initializing chatbot...');

        try {
            // Dynamically import to avoid issues with client-side code
            const { initializeVectorStore } = await import('./lib/langchain/vectorStore.js');

            console.log('📚 [INSTRUMENTATION] Creating vector store embeddings...');
            await initializeVectorStore();

            console.log('✅ [INSTRUMENTATION] Chatbot ready! Vector store initialized successfully.');
        } catch (error) {
            console.error('❌ [INSTRUMENTATION] Failed to initialize chatbot:', error);
            console.error('⚠️  [INSTRUMENTATION] Chatbot will attempt lazy initialization on first request.');
        }
    }
}
