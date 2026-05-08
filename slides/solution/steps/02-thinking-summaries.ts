import { GoogleGenAI } from '@google/genai';

// Initialize the Google GenAI client
const ai = new GoogleGenAI({});

async function main() {
    console.log("Invoking an interaction call with thinking summaries enabled...");

    // 2. Getting thinking summaries
    const interaction = await ai.interactions.create({
        model: 'gemini-3-flash-preview', // Or gemini-3-flash-preview depending on availability, but 3.1-pro is a thinking model
        input: 'How many Rs are in the word strawberry? Think step by step.',
        generation_config: {
            thinking_level: 'low',
            thinking_summaries: 'auto'
        }
    });

    console.log("\nResponse from Gemini:");
    console.log(JSON.stringify(interaction.outputs, null, 2));
}

main().catch(console.error);
