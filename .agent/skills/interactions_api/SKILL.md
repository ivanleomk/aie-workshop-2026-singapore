---
name: interactions-api
description: How to define tools, call the Gemini Interactions API with tools, parse function_call responses, and complete the round-trip by sending function_result back.
---

# Tool Calling with the Gemini Interactions API

Use `@google/genai` and `client.interactions.create()` for tool calling. This is the **Interactions API** — it uses server-side state (`previous_interaction_id`) so you never manually manage history arrays.

## Response Shape at a Glance

Every `interactions.create()` call returns an `Interaction` object. Here are the key fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | The interaction ID. Pass as `previous_interaction_id` in the next call to maintain conversation state. |
| `status` | `"completed"` \| `"requires_action"` | `"completed"` = final text answer. `"requires_action"` = model wants you to execute tool calls first. |
| `steps` | `Step[]` | Chronological array of **all** steps: thoughts, text, and function calls. |
| `outputs` | `Content[]` | Only the **actionable** items — function calls you need to execute, or the final text. |

### Step Types

| `step.type` | Key fields | When it appears |
|-------------|-----------|-----------------|
| `"thought"` | `.text` (reasoning), `.thoughtSignature` | When thinking is enabled. Internal reasoning, not shown to user. |
| `"text"` | `.text` | The model's final text response to the user. |
| `"function_call"` | `.name`, `.arguments`, `.id` | When the model wants to call a tool. `.id` is the **call ID** you must return with results. |

### Input Types

The `input` parameter accepts either a **plain string** (shorthand) or a **`Content[]` array** of structured steps:

```typescript
// Shorthand — just a string
input: "What's the weather in Boston?"

// Structured — an array of content steps
input: [{ type: "text", text: "What's the weather in Boston?" }]
```

When sending structured input, each element has a `type`:

| `type` | Key fields | When to use |
|--------|-----------|-------------|
| `"text"` | `.text` | Sending user text or any freeform message |
| `"function_result"` | `.name`, `.call_id`, `.result` | Returning tool execution results back to the model |

A `function_result` step looks like this:

```typescript
{
    type: "function_result",
    name: "get_weather",              // must match the function_call name
    call_id: "fc_abc123",             // must match the function_call id
    result: [{ type: "text", text: JSON.stringify({ temperature: 72 }) }]
}
```

You can send **multiple** content steps in a single `input` array (e.g. multiple `function_result` entries if the model called several tools at once).

---

## 1. Define a Tool

```typescript
const tools = [{
    type: "function",
    name: "get_weather",
    description: "Get the current weather for a specific location.",
    parameters: {
        type: "object",
        properties: {
            location: { type: "string", description: "City and state, e.g. Boston, MA" }
        },
        required: ["location"]
    }
}];
```

---

## 2. Call the API and Parse the Response

```typescript
import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({});

const response = await client.interactions.create({
    model: "gemini-3-flash-preview",
    input: "What's the weather like in Boston?",
    tools: tools,
    generation_config: { thinking_level: "medium", thinking_summaries: "auto" }
});

// response.status will be "requires_action" if the model wants to call a tool
// response.outputs will contain the function_call(s) to execute
```

Example `response.outputs` when the model calls a tool:

```json
[{
    "type": "function_call",
    "name": "get_weather",
    "id": "fc_abc123",
    "arguments": { "location": "Boston, MA" }
}]
```

---

## 3. Execute the Tool and Send Results Back

```typescript
function getWeather(location: string) {
    return { temperature: 72, condition: "Sunny" };
}

const toolCall = response.outputs.find((o: any) => o.type === "function_call");

const result = getWeather(toolCall.arguments.location);

const response2 = await client.interactions.create({
    model: "gemini-3-flash-preview",
    input: [{
        type: "function_result",
        name: toolCall.name,
        call_id: toolCall.id,
        result: [{ type: "text", text: JSON.stringify(result) }]
    }],
    tools: tools,
    previous_interaction_id: response.id,
    generation_config: { thinking_level: "medium", thinking_summaries: "auto" }
});

// response2.status === "completed", response2.outputs has the final text
```

> [!IMPORTANT]
> Three things are required to close the loop:
> 1. `call_id` — must match the `id` from the `function_call` step
> 2. `previous_interaction_id` — must be `response.id` from the call that triggered the tool
> 3. `result` — an array of content parts (typically `[{ type: "text", text: "..." }]`)

---

## Common Pitfalls

| Mistake | What happens |
|---------|-------------|
| Missing `call_id` | API rejects the `function_result` |
| Missing `previous_interaction_id` | Model forgets why it called the tool — nonsensical response |
| Manually managing history arrays | Works but wastes tokens and is error-prone. Use `previous_interaction_id` instead. |
| Not checking `response.status` | You'll try to parse tool calls from a `"completed"` response that only has text |
