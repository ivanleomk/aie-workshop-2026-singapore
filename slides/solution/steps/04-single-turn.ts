import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs/promises';

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

const tools = [fileTool];

// 2. Real execute function
async function execute(name: string, args: any) {
    if (name === 'read_file') {
        console.log(`\n☁️  Executing local function ${name} with args:`, args);
        try {
            const content = await fs.readFile(args.path, 'utf8');
            return content;
        } catch (error: any) {
            return `Error reading file: ${error.message}`;
        }
    }
    throw new Error(`Unknown tool: ${name}`);
}

async function main() {
    console.log("Starting agent loop...");

    // 3. Initial interaction
    let interaction = await ai.interactions.create({
        model: "gemini-3-flash-preview",
        input: "Read package.json and describe our dependencies",
        generation_config: {
            thinking_level: 'low',
            thinking_summaries: 'auto'
        },
        tools
    });

    // 4. Process the tool call (single turn)
    if (interaction.status === "requires_action" && interaction.outputs) {
        const results = [];

        for (const output of interaction.outputs) {
            if (output.type === "function_call") {
                const args = output.arguments || (output as any).args;

                // Execute the requested tool
                const result = await execute(output.name, args);

                console.log(`\n📤 Sending result back to Gemini: ${result}`);
                results.push({
                    type: "function_result" as const,
                    name: output.name,
                    call_id: output.id,
                    result
                });
            }
        }

        // Send all results back in the next turn
        interaction = await ai.interactions.create({
            model: "gemini-3-flash-preview",
            previous_interaction_id: interaction.id,
            input: results,
            generation_config: {
                thinking_level: "low",
                "thinking_summaries": "auto"
            },
            tools
        });
    }

    console.log(`\n✨ Agent loop finished! Final Response from Gemini:`);
    console.log(JSON.stringify(interaction.outputs, null, 2))
}

main().catch(console.error);
