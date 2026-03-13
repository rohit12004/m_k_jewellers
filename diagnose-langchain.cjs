
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
require('dotenv').config();

async function testLangChainEmbeddings() {
    console.log("Starting LangChain Embeddings Test...");
    try {
        console.log("Testing text-embedding-004...");
        const embeddings1 = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_API_KEY,
            modelName: "text-embedding-004",
        });
        const res1 = await embeddings1.embedQuery("Hello world");
        console.log("✅ text-embedding-004 SUCCESS");
    } catch (e) {
        console.error("❌ text-embedding-004 ERROR:", e.message);
    }
    
    try {
        console.log("Testing embedding-001...");
        const embeddings2 = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_API_KEY,
            modelName: "embedding-001",
        });
        const res2 = await embeddings2.embedQuery("Hello world");
        console.log("✅ embedding-001 SUCCESS");
    } catch (e) {
        console.error("❌ embedding-001 ERROR:", e.message);
    }
    
     try {
        console.log("Testing models/embedding-001...");
        const embeddings3 = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_API_KEY,
            model: "models/embedding-001",
        });
        const res3 = await embeddings3.embedQuery("Hello world");
        console.log("✅ models/embedding-001 SUCCESS");
    } catch (e) {
        console.error("❌ models/embedding-001 ERROR:", e.message);
    }

    process.exit(0);
}

testLangChainEmbeddings();
