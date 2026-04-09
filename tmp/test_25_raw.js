import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function test25() {
    try {
        console.log("Testing gemini-2.5-flash with raw SDK...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Hi");
        console.log("✅ gemini-2.5-flash succeeded!");
    } catch (e) {
        console.log(`❌ gemini-2.5-flash failed:`, e.status, e.message);
    }
}

test25();
