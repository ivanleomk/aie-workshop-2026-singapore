/**
 * bug/fc.ts — Clean reproduction of two Interactions API bugs with function calling
 *
 * Bug 1: function_call steps have no `signature` field
 *   - The thought-signatures docs say Gemini 3 always returns a signature on the
 *     first function call part. But in the Interactions API steps schema, the
 *     signature only appears on the `thought` step — the `function_call` step
 *     has signature: undefined.
 *   - Ref: https://ai.google.dev/gemini-api/docs/thought-signatures#how_it_works
 *
 * Bug 2: Stateless function-call replay via Step[] input returns 400
 *   - The migration guide says: "collect the steps array from the response and
 *     pass it in the input field of the next request"
 *   - But sending [user_input, thought, function_call, function_result] as input
 *     always returns 400 "Request contains an invalid argument."
 *   - The identical function_result works fine when using previous_interaction_id.
 *   - Ref: https://ai.google.dev/gemini-api/docs/interactions-breaking-changes-may-2026#stateless-history
 *
 * Usage: bun bug/fc.ts
 */

import { GoogleGenAI, type Interactions } from "@google/genai";

// Suppress experimental warning
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
    if (typeof args[0] === "string" && args[0].includes("Interactions usage is experimental")) return;
    originalWarn(...args);
};

// ── Shared setup ──────────────────────────────────────────────
const tools: Interactions.Tool[] = [
    {
        type: "function",
        name: "get_weather",
        description: "Get the current weather for a specific location.",
        parameters: {
            type: "object",
            properties: { location: { type: "string" } },
            required: ["location"],
        },
    },
];

function fakeWeather() {
    return { temperature: 72, condition: "Sunny" };
}

// ── Bug 1: function_call steps missing signature ──────────────
async function bug1_missing_signature() {
    console.log("━".repeat(60));
    console.log("BUG 1: function_call step has no signature");
    console.log("━".repeat(60));
    console.log();
    console.log("Expected: function_call step should carry a `signature` field");
    console.log("          (per thought-signatures docs: 'Gemini 3 will always");
    console.log("          have the signature on the first function call part')");
    console.log();

    const client = new GoogleGenAI({});

    const response = await client.interactions.create({
        model: "gemini-3-flash-preview",
        input: "What is the weather in Boston?",
        tools,
        generation_config: { thinking_level: "medium", thinking_summaries: "auto" },
    });

    if (response.status !== "requires_action") {
        console.log("  ⚠  Model didn't call the tool. Re-run.");
        return null;
    }

    // Inspect each step
    for (const step of response.steps ?? []) {
        if (step.type === "thought") {
            console.log(`  [thought]        signature: ${step.signature ? "✅ present" : "❌ MISSING"}`);
        }
        if (step.type === "function_call") {
            console.log(`  [function_call]  signature: ${step.signature ? "✅ present" : "❌ MISSING"}`);
            console.log(`                   name:      ${step.name}`);
            console.log(`                   id:        ${step.id}`);
        }
    }

    console.log();
    console.log("  Result: function_call.signature is always undefined.");
    console.log("          The signature only lives on the thought step.");
    console.log();

    return response;
}

// ── Bug 2: Stateless replay with Step[] input ─────────────────
async function bug2_stateless_replay(response1: Interactions.Interaction) {
    console.log("━".repeat(60));
    console.log("BUG 2: Stateless function-call replay returns 400");
    console.log("━".repeat(60));
    console.log();

    const client = new GoogleGenAI({});
    const fc = response1.steps?.find((s) => s.type === "function_call") as Interactions.FunctionCallStep;

    // Build the exact history the migration guide describes:
    //   1. user_input  (the original prompt)
    //   2. thought     (from response.steps — includes signature)
    //   3. function_call (from response.steps)
    //   4. function_result (we append this)
    const history: Interactions.Step[] = [
        { type: "user_input", content: [{ type: "text", text: "What is the weather in Boston?" }] },
        ...(response1.steps ?? []),
        {
            type: "function_result",
            name: fc.name,
            call_id: fc.id,
            result: [{ type: "text", text: JSON.stringify(fakeWeather()) }],
        },
    ];

    console.log("  History being sent as input:");
    console.log(`    ${history.map((s) => s.type).join(" → ")}`);
    console.log();

    // ── 2a: Stateless replay (FAILS) ──
    console.log("  [2a] Stateless (no previous_interaction_id):");
    try {
        const r = await client.interactions.create({
            model: "gemini-3-flash-preview",
            input: history,
            tools,
            generation_config: { thinking_level: "medium", thinking_summaries: "auto" },
        });
        console.log(`    ✅ Status: ${r.status}`);
    } catch (e: any) {
        console.log(`    ❌ ${e.status}: ${e.message?.split("\n")[0]?.slice(0, 100)}`);
    }

    // ── 2b: With previous_interaction_id (WORKS) ──
    console.log();
    console.log("  [2b] With previous_interaction_id (control):");
    try {
        const r = await client.interactions.create({
            model: "gemini-3-flash-preview",
            input: [
                {
                    type: "function_result" as const,
                    name: fc.name,
                    call_id: fc.id,
                    result: [{ type: "text" as const, text: JSON.stringify(fakeWeather()) }],
                },
            ],
            tools,
            previous_interaction_id: response1.id,
            generation_config: { thinking_level: "medium", thinking_summaries: "auto" },
        });
        console.log(`    ✅ Status: ${r.status}`);
        const text = (r.steps?.find((s) => s.type === "model_output") as any)?.content?.[0]?.text;
        if (text) console.log(`    Response: "${text.slice(0, 80)}..."`);
    } catch (e: any) {
        console.log(`    ❌ ${e.status}: ${e.message?.split("\n")[0]?.slice(0, 100)}`);
    }

    console.log();
    console.log("  Result: Same function_result succeeds with previous_interaction_id");
    console.log("          but fails with stateless Step[] replay.");
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
    console.log();
    console.log("Interactions API Function Calling — Bug Reproduction");
    console.log("Model: gemini-3-flash-preview | SDK: @google/genai >= 2.0.0");
    console.log();

    const r1 = await bug1_missing_signature();
    if (!r1) return;

    await bug2_stateless_replay(r1);
}

main().catch(console.error);
