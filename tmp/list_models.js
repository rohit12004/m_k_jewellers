import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        console.log("Listing available models...");
        // The listModels method is on the client instance in some versions, or via a separate call
        // In @google/generative-ai, we can try to fetch the list if supported
        // But for common usage, we just want to see which name works.
        
        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp", "gemini-2.0-flash"];
        
        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                await model.generateContent("Hi");
                console.log(`✅ ${modelName} is available!`);
            } catch (e) {
                console.log(`❌ ${modelName} failed:`, e.status, e.message.substring(0, 50));
            }
        }
    } catch (error) {
        console.error("List failed:", error);
    }
}

listModels();
