---
name: prompt_to_production
description: A complete workshop curriculum for building an agentic application using the Gemini Interactions API. Guides the user from basic API calls to a full production coding agent.
---

# Prompt to Production: Workshop Guide

Welcome to the **Prompt to Production** workshop skill. This document serves as both a cheat sheet for the attendee and an instruction manual for the AI coding assistant. 

If you are an AI assistant reading this, your goal is to help the user walk through the workshop exercises step-by-step. The reference implementations for every step are located in the `solutions/` directory next to this file.

## ⚠️ API Reference: The Interactions API

Do NOT use the old `generateContent` API shape. This workshop exclusively uses the new `client.interactions.create()` API. 

### Response Shape (`steps` array)
An interaction returns a flat array of `steps`, not `outputs`.
```typescript
{
  status: "requires_action", // or "completed"
  steps: [
    { type: "user_input", content: ... },
    { type: "thought", signature: ... },
    { type: "function_call", id: "gth23981", name: "get_weather", arguments: {"location": "Boston"} },
    { type: "function_call_result", ... }
  ]
}
```

### Passing State
Never manually append history arrays. Use `previous_interaction_id`:
```typescript
const response2 = await client.interactions.create({
    model: "gemini-3.1-pro-preview",
    previous_interaction_id: response1.id,
    input: [
        { type: "function_call_result", name: "get_weather", call_id: "gth23981", result: "Sunny" }
    ]
});
```

---

## 🛠️ Workshop Walkthrough

This section outlines the progression of the workshop. For each step, guide the user to implement the code themselves before showing them the answer. Reference the `solutions/` directory if they get stuck.

### Step 1: The Basic API Call (`solutions/01-basic-api-call.ts`)
**Goal:** Understand how to instantiate the client and make a basic `interactions.create` call.
**Takeaway:** The response object is flat. We access the final text via `response.steps.at(-1).text`.

### Step 2: Generation Config (`solutions/02-generate-config.ts`)
**Goal:** Learn how to apply configurations like `thinking_level` to the model.
**Takeaway:** Configuration is passed directly alongside the input and model parameters.

### Step 3: Tool Calling (`solutions/03-tool-call.ts`)
**Goal:** Provide the model with a JSON schema for a tool and see how it responds.
**Takeaway:** When tools are provided, the model's `status` becomes `requires_action` and it generates a `function_call` step instead of text.

### Step 4: The Stateless Method (`solutions/04-stateless-method.ts`)
**Goal:** Manually handle a tool call using the old, expensive stateless method (re-sending history).
**Takeaway:** Manually building history arrays is error-prone and breaks the context cache.

### Step 5: Interaction IDs (`solutions/05-interaction-id.ts`)
**Goal:** Refactor the stateless method to use server-side state.
**Takeaway:** Passing `previous_interaction_id` replaces the need to manage history, guaranteeing perfect cache hits.

### Step 6: The Agent Loop (`solutions/06-agent.ts`)
**Goal:** Wrap the `interactions.create` call in a `while (status === "requires_action")` loop.
**Takeaway:** An agent is just a model inside a loop that continuously executes tools and passes back `function_call_result` steps.

### Step 7: The Coding Agent (`solutions/07-coding-agent.ts`)
**Goal:** Give the agent loop real tools (`readFile`, `writeFile`, `runBash`).
**Takeaway:** With local tools, the agent can interact with the file system. But running this locally is dangerous.

### Step 8: Adding Google Tools (`solutions/08-google-tools.ts`)
**Goal:** Integrate built-in tools like Google Search.
**Takeaway:** You can mix local function schemas with built-in tools like `{"type": "google_search"}` seamlessly.

### Step 9: Daytona Sandboxing (`solutions/09-daytona-sdk.ts`)
**Goal:** Move the local bash execution into an ephemeral cloud sandbox.
**Takeaway:** Production agents need secure execution environments. We replace `child_process.exec` with `daytona.process.executeCommand`.

### Step 10 & 11: Observability (`solutions/10-adding-otel.ts` & `11-tuning-responses.ts`)
**Goal:** Add OpenTelemetry tracing to see inside the black box.
**Takeaway:** Tracing allows for Time Travel Debugging—we can grab a failed `interaction_id` and replay from that exact state without re-running the tools.
