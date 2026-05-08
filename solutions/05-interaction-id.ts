import { GoogleGenAI, Interactions } from "@google/genai";
import chalk from "chalk";
import { printRawResponse } from "./lib/console";


const originalWarn = console.warn;
console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Interactions usage is experimental')) return;
    originalWarn(...args);
};

// This is our fake local function
function getWeather(location: string) {
    console.log(chalk.cyan(`\n[Server: Executing local function getWeather('${location}')...]`));
    return { temperature: 72, condition: "Sunny" };
}

async function main() {
    const client = new GoogleGenAI({});

    // The "Trap": Managing tool state manually
    // We have to keep a local array of every single step in the timeline
    let history: Interactions.Turn[] = [];

    const tools = [{
        type: "function" as const,
        name: "get_weather",
        description: "Get the current weather for a specific location.",
        parameters: { type: "object", properties: { location: { type: "string" } }, required: ["location"] }
    }];

    // --- TURN 1: The Request ---
    const userPrompt = "What is the weather in Boston?";
    console.log(chalk.blueBright("\nUser > ") + userPrompt);

    // 1. Manually format and append the user input step
    history.push({ role: "user", content: [{ type: "text", text: userPrompt }] });

    const response1 = await client.interactions.create({
        model: "gemini-3-flash-preview",
        input: history,
        tools: tools,
        generation_config: { thinking_level: "medium", thinking_summaries: "auto" }
    });

    printRawResponse(response1);


    if (response1.status !== "requires_action") {
        console.log("No tools were called!")
        process.exit(1);
    }

    response1.outputs?.forEach(output => {

        if (output.type === "function_call") {
            const args = output.arguments;
            console.log("location", args);
            const result = getWeather(args.location);


            // 3. Append the function result to our history
            history.push({
                role: "user",
                content: [{
                    type: "function_result",
                    name: "get_weather",
                    call_id: output.id,
                    result: [{ type: "text", text: JSON.stringify(result) }]
                }]
            });
        }

    })



    // 4. Send the massive history array back across the wire
    // We are paying input tokens for the user prompt, the thoughts, the tool call, AND the result!
    console.dir(history, { depth: null });
    const response2 = await client.interactions.create({
        model: "gemini-3-flash-preview",
        input: history,
        tools: tools,
        previous_interaction_id: response1.id,
        generation_config: { thinking_level: "medium", thinking_summaries: "auto" }
    });

    // Save the final text response back to our history array
    printRawResponse(response2);
}

main().catch(console.error);
