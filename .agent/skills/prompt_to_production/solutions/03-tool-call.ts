import { GoogleGenAI } from "@google/genai";
import chalk from "chalk";
import { printRawResponse, getUserInput } from "./lib/console";

const originalWarn = console.warn;
console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Interactions usage is experimental')) return;
    originalWarn(...args);
};

async function main() {
    const client = new GoogleGenAI({});

    const userInput = await getUserInput("User > ");

    // 1. Send a request with a tool attached
    // We are giving the model the ability to call the "get_weather" function
    const response = await client.interactions.create({
        model: "gemini-3-flash-preview",
        input: [{
            type: "user_input",
            content: [{
                type: "text",
                text: userInput
            }]
        }],
        generation_config: {
            thinking_level: "medium",
            thinking_summaries: "auto"
        },

        // 2. The tools array is polymorphic now! 
        // We declare `type: "function"` right on the object, dropping the old `functionDeclarations` nesting.
        tools: [{
            type: "function",
            name: "get_weather",
            description: "Get the current weather for a specific location.",
            parameters: {
                type: "object",
                properties: {
                    location: {
                        type: "string",
                        description: "The city and state, e.g., Boston, MA"
                    }
                },
                required: ["location"]
            }
        }]
    });

    if (!response.steps || response.steps.length === 0) {
        console.log(chalk.red("No outputs found in the response."));
        return;
    }

    // 3. Instead of parsing it, let's look at exactly what the new API returns!
    console.dir(response, { depth: null, colors: true, compact: false });
    // You will see a `thought` step, followed by a `function_call` step!
    printRawResponse(response);
}

main().catch(console.error);
