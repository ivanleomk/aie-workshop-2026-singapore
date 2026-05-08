# AIE Workshop 2026 - Singapore

Welcome to the AIE 2026 Singapore Workshop repository! This project walks you through building advanced, agentic workflows using the **Google GenAI SDK**, **Daytona**, and **OpenTelemetry (Logfire)**.

## Progression Overview

The `solutions/` directory contains a step-by-step progression, demonstrating how to move from basic API calls to a fully-instrumented, autonomous coding agent running in a secure cloud sandbox.

### Phase 1: Core API Mechanics
* **`01-basic-api-call.ts`**: The foundational setup. Learn how to authenticate and make a standard text generation request using the GenAI SDK.
* **`02-generate-config.ts`**: Controlling model behavior. Introduction to configuring the generation parameters (like thinking level and JSON schema structures).
* **`03-tool-call.ts`**: Connecting external capabilities. Defines a basic tool schema and processes the model's function call request.

### Phase 2: State Management & Agent Loops
* **`04-stateless-method.ts`**: Manual state management. Demonstrates how to handle a continuous conversation by manually passing the dialogue history back and forth.
* **`05-interaction-id.ts`**: Server-side state management. The "Aha!" moment—utilizing the new `previous_interaction_id` parameter to let the API maintain the conversational state for you.
* **`06-agent.ts`**: The first agent loop. Wrapping the previous concepts into a stateful `Agent` class that recursively handles function calling until a final response is generated.

### Phase 3: Building a Coding Agent
* **`07-coding-agent.ts`**: A practical application. Giving the agent `readFile`, `editFile`, and `bash` tools to act as a local coding assistant.
* **`08-google-tools.ts`**: Expanding the tool belt. Integrating built-in Google Grounding (Google Search) and URL Context tools to provide the agent with internet access.
* **`09-daytona-sdk.ts`**: Secure execution. Transitioning the agent's dangerous bash and file execution tools from your local machine to an isolated, ephemeral **Daytona Sandbox**.

### Phase 4: Observability & Iterative Tuning
* **`10-adding-otel.ts`**: Adding observability. Instrumenting the entire agent loop using **OpenTelemetry (via Logfire)** to create deep traces. We wrap API calls and tool executions in spans to track latency, token usage, and payloads.
* **`11-tuning-responses.ts`**: The final experimenting loop. Using the captured Logfire traces to extract the `previous_interaction_id` at specific points in a conversation. This enables developers to inject localized system reminders (e.g. testing new personas or prompt tweaks) and perfectly replay the model's response generation without rerunning the entire conversation loop.

---

## How to use
To run any of the solutions, use the `bun run` command:
```bash
bun run solutions/11-tuning-responses.ts
```

For the experimenting scratchpad workflow mentioned in step 11, see the corresponding skill guide inside the `.agent/skills/tuning_responses` directory!
