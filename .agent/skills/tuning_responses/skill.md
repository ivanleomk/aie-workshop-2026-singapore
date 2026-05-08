# Tuning Gemini Agent Responses with Logfire

This skill provides a walkthrough on how to extract context from Logfire to reproduce and experiment with specific agent states using the Gemini Interactions API. This is particularly useful for tuning how an agent responds to tool results or user inputs without having to rerun the entire conversation from the beginning.

## Project Details
**Logfire Project Name:** `agent-demos`

## Steps to Experiment

### 1. Identify the Target State in Logfire
First, locate the point in the conversation where you want to test a new prompt or reminder.
- Go to your Logfire dashboard for the `agent-demos` project.
- Find the relevant trace and span (e.g., the `Gemini API Call` span right before the model generates its final response).
- Extract the `previousInteractionId` from the span's attributes. This ID encapsulates the entire conversation history up to that point.
- Note the `call_id` and the tool name if you are simulating a tool response.

### 2. Extract the Input Payload to `input.json`
Rather than hardcoding large payloads directly in your code, extract the exact `input` array from Logfire and save it to a local JSON file. 
- In your Logfire trace, find the `input` attribute on the span.
- Copy the JSON value and save it to a file named `input.json` in your workspace.

### 3. Create a Scratchpad Script
Create a local script (e.g., `scratch.ts`) to read your `input.json`, modify it to inject your experiments, and hit the Interactions API directly.

> [!IMPORTANT]
> **Do not modify the original System Instructions (SI) in your source files!** The purpose of this workflow is to keep your application logic intact while experimenting with system reminders and persona constraints by injecting them directly into the input payload.

```typescript
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

const client = new GoogleGenAI({});

async function main() {
    // 1. Read the base input from your saved file
    const rawInput = fs.readFileSync("input.json", "utf-8");
    const inputPayload = JSON.parse(rawInput);

    // 2. Inject your constraints or reminders
    // For example, if the last item is a function_result:
    const lastItem = inputPayload[inputPayload.length - 1];
    if (lastItem.type === "function_result") {
        lastItem.result.push({
            type: "text", 
            text: "REMINDER: start your response with 'ya lor' and talk only in lowercase casual slang."
        });
    }

    // 3. Test the variation using the Interactions API
    const response = await client.interactions.create({
        model: "gemini-3-flash-preview",
        input: inputPayload,
        // Use the ID extracted from Logfire
        previous_interaction_id: "v1_YOUR_INTERACTION_ID",
        generation_config: { thinking_level: "medium", thinking_summaries: "auto" }
    });
    
    console.log(JSON.stringify(response.outputs, null, 2));
}

main().catch(console.error);
```

### 4. Run and Iterate
Run the script (`bun run scratch.ts`) to see how the model responds to your new instructions. Because you are using `previous_interaction_id`, the model perfectly resumes the conversation state. You can rapidly iterate on your prompt injection until the model behaves exactly as desired.

### 5. Backporting to the Agent Application
Once you find the perfect tuning strategy via the scratch script, backport the changes into your main agent loop (e.g., in `Agent.run`).

**Example: Injecting Reminders into Tool Responses**
If you decided to inject a system reminder into a tool result, intercept the `function_call` handling and append the reminder directly into the `function_result` payload:

```typescript
results.push({
    type: "function_result",
    name: funcName,
    call_id: output.id,
    result: [
        { type: "text", text: JSON.stringify(result) },
        // Inject the successful reminder here!
        { type: "text", text: "REMINDER: Start your response with 'ya lor i tell u ah...' and use casual Singlish slang." }
    ]
});
```

This ensures the model receives a continuous "nudge" exactly when it processes external data.
