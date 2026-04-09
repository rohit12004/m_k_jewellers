import OpenAI from "openai";
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY;

async function testEndpoint(baseUrl, modelName) {
    try {
        console.log(`Testing ${modelName} on ${baseUrl}...`);
        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: baseUrl
        });
        const response = await openai.chat.completions.create({
            model: modelName,
            messages: [{ role: "user", content: "Hi" }],
            max_tokens: 10
        });
        console.log(`✅ Success! Response:`, response.choices[0].message.content);
        return true;
    } catch (error) {
        console.error(`❌ Failed:`, error.status, error.message);
        return false;
    }
}

async function run() {
    await testEndpoint("https://generativelanguage.googleapis.com/v1beta/openai/", "gemini-1.5-pro");
}

run();
