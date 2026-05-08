/**
 * bug/02-stateless-fc.ts — Stateless function-call replay (BROKEN)
 *
 * Follows the migration guide's stateless history pattern:
 *   "collect the steps array from the response and pass it
 *    in the input field of the next request"
 *
 * Sends: [user_input, thought, function_call, function_result]
 * Gets:  400 "Request contains an invalid argument."
 *
 * Ref: https://ai.google.dev/gemini-api/docs/interactions-breaking-changes-may-2026#stateless-history
 *
 * Usage: bun bug/02-stateless-fc.ts
 */

import { GoogleGenAI, type Interactions } from "@google/genai";

const client = new GoogleGenAI({});

const tools: Interactions.Tool[] = [{
    type: "function",
    name: "get_weather",
    description: "Get the current weather for a specific location.",
    parameters: {
        type: "object",
        properties: { location: { type: "string" } },
        required: ["location"],
    },
}];

function getWeather(location: string) {
    console.log(`  [executing getWeather("${location}")]`);
    return { temperature: 72, condition: "Sunny" };
}

async function main() {
    const history: Interactions.Step[] = [
        { type: "user_input", content: [{ type: "text", text: "What is the weather in Boston?" }] }
    ]
    // ── Turn 1: Get the function call ──
    console.log("── Turn 1: Request ──");
    const response1 = await client.interactions.create({
        model: "gemini-3-flash-preview",
        input: "What is the weather in Boston?",
        tools,
        generation_config: { thinking_level: "medium", thinking_summaries: "auto" },
    });

    if (response1.status !== "requires_action") {
        console.log("Model didn't call a tool. Re-run.");
        return;
    }

    const fc = response1.steps?.find(s => s.type === "function_call") as Interactions.FunctionCallStep;
    console.log(`  Status: ${response1.status}`);
    console.log(`  Tool call: ${fc.name}(${JSON.stringify(fc.arguments)})`);

    // ── Build stateless history ──
    // Exactly what the migration guide says: user_input + response steps + function_result
    history.push(...(response1.steps ?? []));

    // Execute the tool and append the result
    const result = getWeather(fc.arguments.location as string);


    // ── Turn 2: Send history back (NO previous_interaction_id) ──
    try {
        const response2 = await client.interactions.create({
            model: "gemini-3-flash-preview",
            input: [{
                type: "function_result",
                name: fc.name,
                call_id: fc.id,
                result: [{ type: "text", text: JSON.stringify(result) }],
            }],
            tools,
            previous_interaction_id: response1.id,
            generation_config: { thinking_level: "medium", thinking_summaries: "auto" },
        });

        console.log(`  ✅ Status: ${response2.status}`);
        const text = (response2.steps?.find(s => s.type === "model_output") as any)?.content?.[0]?.text;
        if (text) console.log(`  Response: "${text.slice(0, 100)}..."`);
    } catch (e: any) {
        console.log(`  ❌ ${e.status}: ${e.message?.split("\n")[0]}`);
    }
}

main().catch(console.error);
