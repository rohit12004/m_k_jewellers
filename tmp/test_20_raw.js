import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function test20() {
    try {
        console.log("Testing gemini-2.0-flash-exp with raw SDK...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result = await model.generateContent("Hi");
        console.log("✅ gemini-2.0-flash-exp succeeded!");
    } catch (e) {
        console.log(`❌ gemini-2.0-flash-exp failed:`, e.status, e.message);
    }
}

test20();
