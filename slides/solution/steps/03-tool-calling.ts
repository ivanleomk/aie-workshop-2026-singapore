import { GoogleGenAI } from '@google/genai';

// Initialize the Google GenAI client
const ai = new GoogleGenAI({});

// 1. Define the tool
const fileTool = {
    type: 'function' as const,
    name: 'read_file',
    description: 'Reads the content of a file.',
    parameters: {
        type: 'object' as const,
        properties: {
            path: { type: 'string' as const, description: 'The path to the file to read, e.g. example.txt' }
        },
        required: ['path']
    }
};

async function main() {
    console.log("Invoking an interaction call with a tool defined...");

    // 2. Send the request with tools
    let interaction = await ai.interactions.create({
        model: 'gemini-3-flash-preview',
        input: 'Read example.txt and summarize it',
        tools: [fileTool],
        generation_config: {
            thinking_level: 'low',
            thinking_summaries: 'auto'
        }
    });

    console.log(JSON.stringify(interaction.outputs, null, 2))



}

main().catch(console.error);
