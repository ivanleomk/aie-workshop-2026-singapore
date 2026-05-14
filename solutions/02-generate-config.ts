import { GoogleGenAI } from "@google/genai";
import chalk from "chalk";
import { formatMarkdown } from "./lib/markdown";
import { printRawResponse, getUserInput } from "./lib/console";

const originalWarn = console.warn;
console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Interactions usage is experimental')) return;
    originalWarn(...args);
};

async function main() {
    // 1. Initialize the Google Gen AI SDK
    const client = new GoogleGenAI({});

    const userInput = await getUserInput("User > ");

    // 2. Make a basic call to the Interactions API
    // Notice how we don't pass any history or context here!
    const response = await client.interactions.create({
        model: "gemini-3-flash-preview",
        input: [{
            type: "user_input",
            content: [{
                type: "text",
                text: userInput
            }]
        }],

        // Add Thinking Config
        generation_config: {
            thinking_level: "low",
            thinking_summaries: "auto"
        }
    });

    if (!response.steps || response.steps.length === 0) {
        console.log(chalk.red("No outputs found in the response."));
        return;
    }

    // 3. Instead of parsing it, let's look at exactly what the new API returns!
    // Notice how everything is wrapped in a chronological "steps" array.
    printRawResponse(response);
}

main().catch(console.error);
