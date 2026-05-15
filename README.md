# Prompt to Production: Building Agents with Gemini

Welcome to the AI Engineer Singapore 2026 workshop repository! In this workshop, you'll learn how to move past brittle LLM scripts and build robust, production-ready coding agents using the **Gemini Interactions API**, **Daytona Sandboxes**, and **Logfire Tracing**.

## 🛠️ Prerequisites

Before we begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- A code editor (like VS Code, Cursor, or Windsurf)

## 🔑 Setup Instructions

### 1. Get your API Keys
You will need a few API keys to complete the full workshop:
1. **Google Gemini API Key:** Get it from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. **Daytona API Key (Optional but recommended):** For secure sandboxing in Step 9.
3. **Logfire Token (Optional but recommended):** For OpenTelemetry tracing in Step 10.

### 2. Configure your Environment
Clone this repository and set up your `.env` file:

```bash
git clone https://github.com/ivanleomk/aie-workshop-2026-singapore.git
cd aie-workshop-2026-singapore

# Install dependencies
npm install

# Copy the example environment file
cp .env.example .env
```

Open `.env` in your editor and paste your API keys.

### 3. Install the Workshop Curriculum Skill
If you are using an AI Coding Assistant (like Antigravity, Cursor, or Windsurf), we have built a custom AI Skill that acts as the curriculum engine for this workshop. It will teach your AI how to use the Interactions API and guide you step-by-step.

Run this command in your terminal:
```bash
npx skills add ivanleomk/aie-workshop-2026-singapore --skill prompt_to_production
```

> **Note:** Alternatively, you can just open the `.agent/skills/prompt_to_production/SKILL.md` file in your editor to read the instructions manually.

## 🚀 Running the Exercises

The workshop consists of 11 progressive steps. All starting code and solutions are provided in the `/solutions` directory.

To run a specific exercise, you can use `npx tsx`:
```bash
npx tsx solutions/01-basic-api-call.ts
```

If you get stuck, remember to ask your AI assistant: *"Help me with Step X of the Prompt to Production workshop."*
