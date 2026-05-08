import { GoogleGenAI, Interactions } from "@google/genai";
import chalk from "chalk";
import { printRawResponse } from "./lib/console";
import * as readline from "node:readline/promises";

const originalWarn = console.warn;
console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Interactions usage is experimental')) return;
    originalWarn(...args);
};

// 1. Define our tool functions
const localTools = {
    get_weather: (args: { location: string }) => {
        console.log(chalk.cyan(`\n[Server: Executing local function getWeather('${args.location}')...]`));
        return { temperature: 72, condition: "Sunny" };
    }
};

class Agent {
    private client: GoogleGenAI;
    private previousInteractionId: string | undefined = undefined;
    private tools = [{
        type: "function" as const,
        name: "get_weather",
        description: "Get the current weather for a specific location.",
        parameters: { type: "object", properties: { location: { type: "string" } }, required: ["location"] }
    }];

    constructor() {
        this.client = new GoogleGenAI({});
    }

    async run(userPrompt: string) {
        let currentInput: any = [{ type: "text", text: userPrompt }];

        // --- The Agent Loop ---
        // We loop until the model gives us a final text response!
        while (true) {
            console.log(chalk.dim(`\n[Agent: Sending request to Gemini...]`));
            const response = await this.client.interactions.create({
                model: "gemini-3-flash-preview",
                input: currentInput,
                tools: this.tools,
                previous_interaction_id: this.previousInteractionId,
                generation_config: { thinking_level: "medium", thinking_summaries: "auto" }
            });

            printRawResponse(response);

            // Update interaction ID for the next turn
            this.previousInteractionId = response.id;

            // If the model is done and gave us text, break the loop!
            if (response.status !== "requires_action") {
                console.log(chalk.green("\n[Agent: Finished task!]"));
                break;
            }

            // Otherwise, it wants to call tools. Let's build the results array.
            const results: any[] = [];

            response.outputs?.forEach((output: any) => {
                if (output.type === "function_call") {
                    const funcName = output.name as keyof typeof localTools;
                    const args = output.arguments;

                    if (localTools[funcName]) {
                        // Execute the local tool
                        const result = localTools[funcName](args as any);

                        // Add the result to the input for the next turn
                        results.push({
                            type: "function_result",
                            name: funcName,
                            call_id: output.id,
                            result: [{ type: "text", text: JSON.stringify(result) }]
                        });
                    } else {
                        console.error(chalk.red(`\n[Agent Error: Tool ${funcName} not found!]`));
                    }
                }
            });

            // Set the current input to the function results for the next iteration
            currentInput = results;
        }
    }
}

async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const agent = new Agent();

    console.log(chalk.green("🤖 Agent is ready! Type 'exit' or 'quit' to close."));

    while (true) {
        const input = await rl.question(chalk.blueBright("\nUser > "));
        
        if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
            break;
        }

        await agent.run(input);
    }

    rl.close();
}

main().catch(console.error);
