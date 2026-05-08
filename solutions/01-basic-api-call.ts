import { GoogleGenAI } from "@google/genai";
import chalk from "chalk";
import { printRawResponse } from "./lib/console";

const originalWarn = console.warn;
console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Interactions usage is experimental')) return;
    originalWarn(...args);
};

async function main() {
    // 1. Initialize the Google Gen AI SDK
    const client = new GoogleGenAI({});

    console.log(chalk.blueBright("User > ") + "What is the capital of France?");

    // 2. Make a basic call to the Interactions API
    const response = await client.interactions.create({
        model: "gemini-3-flash-preview",
        input: "What is the capital of France?"
    });

    if (!response.outputs || response.outputs.length == 0) {
        console.log(chalk.red("No outputs found in the response."));
        return;
    }

    printRawResponse(response);

}

main().catch(console.error);
