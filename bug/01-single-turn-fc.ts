/**
 * bug/01-single-turn-fc.ts — Single-turn function call
 *
 * Shows that the Interactions API returns a function_call step
 * WITHOUT a signature field. The signature only lives on the
 * separate `thought` step.
 *
 * Expected (per thought-signatures docs):
 *   "Gemini 3 will always have the signature on the first function call part"
 *
 * Actual:
 *   function_call.signature === undefined
 *
 * Usage: bun bug/01-single-turn-fc.ts
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

async function main() {
    const response = await client.interactions.create({
        model: "gemini-3-flash-preview",
        input: "What is the weather in Boston?",
        tools,
        generation_config: { thinking_level: "medium", thinking_summaries: "auto" },
    });

    console.dir(response, { depth: null });
}

main().catch(console.error);
