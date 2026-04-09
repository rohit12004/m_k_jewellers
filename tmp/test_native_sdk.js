import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY;

async function testNativeSDK() {
    try {
        console.log("Testing native ChatGoogleGenerativeAI with gemini-1.5-flash...");
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-1.5-flash",
            apiKey: apiKey,
            maxOutputTokens: 50,
        });

        const response = await model.invoke([
            new HumanMessage("Hi, what's your name?")
        ]);

        console.log("✅ Success! Response:", response.content);
        return true;
    } catch (error) {
        console.error("❌ Failed:", error.message);
        return false;
    }
}

testNativeSDK();
