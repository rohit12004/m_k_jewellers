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

async function runTests() {
    const models = [
        "models/gemini-1.5-flash",
        "models/gemini-1.5-pro",
        "gemini-1.5-flash-latest",
        "gpt-3.5-turbo" // Some adapters map this
    ];

    for (const model of models) {
        await testModel(model);
        console.log("---");
    }
}

runTests();
