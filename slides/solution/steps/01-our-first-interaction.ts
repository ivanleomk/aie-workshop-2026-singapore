import { GoogleGenAI } from '@google/genai';

// Initialize the Google GenAI client
// It will automatically use the GEMINI_API_KEY environment variable
const ai = new GoogleGenAI({});

async function main() {
    console.log("Invoking an interaction call to gemini-3-flash-preview...");

    // 1. Creating our first interaction
    const interaction = await ai.interactions.create({
        model: 'gemini-3-flash-preview',
        input: 'Hello! Can you give me a one sentence summary of what an AI agent is?',
    });

    console.log("\nResponse from Gemini:");
    console.log(interaction.outputs);
}

main().catch(console.error);