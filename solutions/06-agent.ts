import { GoogleGenAI, Interactions } from "@google/genai";
import chalk from "chalk";
import { printRawResponse } from "./lib/console";

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
    },
    get_time: (args: { timezone: string }) => {
        console.log(chalk.cyan(`\n[Server: Executing local function get_time('${args.timezone}')...]`));
        return { time: new Date().toLocaleTimeString('en-US', { timeZone: args.timezone }) };
    }
};

async function main() {
    const client = new GoogleGenAI({});

    const tools = [{
        type: "function" as const,
        name: "get_weather",
        description: "Get the current weather for a specific location.",
        parameters: { type: "object", properties: { location: { type: "string" } }, required: ["location"] }
    }, {
        type: "function" as const,
        name: "get_time",
        description: "Get the current time for a specific timezone.",
        parameters: { type: "object", properties: { timezone: { type: "string" } }, required: ["timezone"] }
    }];

    const userPrompt = "What is the weather in Boston right now, and what time is it in Tokyo?";
    console.log(chalk.blueBright("\nUser > ") + userPrompt);

    let currentInput: Interactions.TurnInput = [{ type: "text", text: userPrompt }];
    let previousInteractionId: string | undefined = undefined;

    // --- The Agent Loop ---
    // We loop until the model gives us a final text response!
    while (true) {
        console.log(chalk.dim(`\n[Agent: Sending request to Gemini...]`));
        const response: Interactions.InteractionsCreateResponse = await client.interactions.create({
            model: "gemini-3-flash-preview",
            input: currentInput,
            tools: tools,
            previous_interaction_id: previousInteractionId,
            generation_config: { thinking_level: "medium", thinking_summaries: "auto" }
        });

        printRawResponse(response);
        
        // Update interaction ID for the next turn
        previousInteractionId = response.id;

        // If the model is done and gave us text, break the loop!
        if (response.status !== "requires_action") {
            console.log(chalk.green("\n[Agent: Finished task!]"));
            break;
        }

        // Otherwise, it wants to call tools. Let's build the results array.
        const results: any[] = [];

        response.outputs?.forEach(output => {
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

main().catch(console.error);
