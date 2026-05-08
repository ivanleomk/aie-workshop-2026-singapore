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

### 2. Create a Scratch Script
Create a local script (e.g., `scratch.ts`) to hit the Interactions API directly, bypassing the interactive agent loop. 

Initialize the client and set up the `interactions.create` call:
```typescript
import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({});

async function main() {
    const response = await client.interactions.create({
        model: "gemini-3-flash-preview",
        // Inject your modified inputs here
        input: [],
        // Use the ID extracted from Logfire
        previous_interaction_id: "v1_YOUR_INTERACTION_ID",
        generation_config: { thinking_level: "medium", thinking_summaries: "auto" }
    });
    
    console.log(JSON.stringify(response.outputs, null, 2));
}

main().catch(console.error);
```

### 3. Inject Constraints or Reminders
If you want to append a system reminder or test a prompt constraint exactly at the moment of a tool response, you can inject it directly into the `input` array. 

For example, to append a style constraint after a `bash` tool call:
```typescript
input: [
    {
        type: "function_result",
        name: "bash",
        call_id: "wvvw2sdm", // Extracted from Logfire
        result: [
            { type: "text", text: "\"The 45th prime number is: 197\"" },
            // Inject your experimental prompt here!
            { type: "text", text: "REMINDER: start your response with ayyyy and then talk only in lowercase and short casual slang." }
        ]
    }
]
```

Alternatively, you could provide the reminder via the `system_instruction` parameter in the `interactions.create` call.

### 4. Run and Iterate
Run the script (`bun run scratch.ts`) to see how the model responds to your new instructions. Because you are using `previous_interaction_id`, the model perfectly resumes the conversation state. You can rapidly iterate on your prompt injection until the model behaves exactly as desired, and then backport those changes to your main agent application!
