import OpenAI from "openai";
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY;
const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

async function testModel(modelName) {
    try {
        console.log(`Testing model: ${modelName}...`);
        const response = await openai.chat.completions.create({
            model: modelName,
            messages: [{ role: "user", content: "Hi" }],
            max_tokens: 10
        });
        console.log(`✅ Success with ${modelName}:`, response.choices[0].message.content);
        return true;
    } catch (error) {
        console.error(`❌ Failed with ${modelName}:`, error.status, error.message);
        return false;
    }
}

async function run() {
    await testModel("gemini-1.5-flash-latest");
    await testModel("gemini-1.5-flash-8b");
    await testModel("lb-gemini-1.5-flash"); // Some loaders use this
}

run();
