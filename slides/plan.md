# Prompt to Production — Presentation Plan

> Building and deploying a coding agent from scratch with the Interactions API, AI Studio, and Antigravity

## Source Material

| Source | Focus | What to borrow |
|--------|-------|-----------------|
| **Workshop HTML** (Philipp's) | Interactions API deep-dive + hands-on exercises | API primitives, data model, agent loop, code comparison vs generateContent |
| **Conversational Agents PDF** | Broader Gemini ecosystem + Antigravity intro | Model timeline, Interactions API intro, AI Studio, Antigravity screenshots, skills |
| **Live API PDF** (Thor's) | Audio/multimodal real-time agents | Skip — not relevant unless we want a "what else" teaser |

---

## Structure (~16 slides + live demo)

### Part 0: Opening (2 slides, ~2 min)

**Slide 1 — Title** (`layout: title`)
- "Prompt to Production"
- Subtitle: "Building and deploying a coding agent from scratch with the Interactions API, AI Studio, and Antigravity"
- Speaker info, event, date

**Slide 2 — Agenda** (`layout: section`)
- 4 sections with color-coded numbers:
  1. The Landscape (new models)
  2. The Toolchain (AI Studio + Antigravity)
  3. The Interactions API
  4. Live Demo

---

### Part 1: The Landscape (3 slides, ~5 min)

**Slide 3 — Shipping at Relentless Pace** (`layout: bento`)
- 4 cards showing model families:
  - Frontier Models (Gemini 3.x Pro/Flash)
  - Open Models (Gemma 4)
  - genMedia Models (Imagen 4, Veo 3, Lyria)
  - Audio Models (Live API, TTS)
- Key message: incredible pace of releases

**Slide 4 — From Understanding → Action** (`layout: text`)
- Gemini 1 = Understanding
- Gemini 2 = Thinking
- Gemini 3 = Action
- "Gemini 3 is built for action — tool use, agents, agentic workflows"

**Slide 5 — Gemini API Inputs & Outputs** (`layout: bento`)
- Left cards: Inputs (text, image, audio, video, URLs, API info)
- Right cards: Outputs (text, image, audio, video, function calls, code)
- Shows the breadth of multimodal capability

---

### Part 2: The Toolchain (3 slides, ~5 min)

**Slide 6 — AI Studio: Zero to API Key** (`layout: text`)
- Visit aistudio.google.com
- Get API key — no credit card, generous free tier
- Prototype with the playground
- One-click to code

**Slide 7 — Antigravity: AI-Powered Development** (`layout: bento`)
- 4 panels showing Antigravity features:
  1. Editor View — AI-powered IDE
  2. Agent Side Panel — conversation mode
  3. Terminal — integrated shell
  4. Agent Manager — workspaces & playground
- Link: antigravity.google

**Slide 8 — Skills: Teaching Your Agent** (`layout: text`)
- Show directory structure:
  ```
  .agent/skills/my-skill/
  ├── SKILL.md          # Main instructions
  ├── scripts/          # Helper scripts
  ├── examples/         # Reference implementations
  └── resources/        # Templates and assets
  ```
- Workspace skills vs global skills
- "This is how Antigravity knows what to do"

---

### Part 3: The Interactions API (5 slides, ~8 min)

**Slide 9 — Introducing the Interactions API** (`layout: text`)
- "A unified API for models AND agents"
- Two code snippets side by side:
  - `model="gemini-3-flash-preview"` for models
  - `agent="deep-research-pro-preview"` for agents
- Key benefits: server-side state, background tasks, combined tool use

**Slide 10 — Key Differences vs generateContent** (`layout: text`)
- Before/After comparison:
  - generateContent: client manages history, re-send everything, nested protos, no agents, no background
  - Interactions API: server owns state, send only new input, flat typed blocks, built-in agents, background + polling
- Callout: "Not a replacement — use generateContent for simple stateless calls"

**Slide 11 — Core Primitives** (`layout: bento`)
- 4 cards with code snippets:
  1. **Server-Side State** — `previous_interaction_id=i1.id`
  2. **Background Execution** — `background=True`
  3. **Typed Output Blocks** — `match o.type: case "text" / "function_call"`
  4. **Streaming via SSE** — `stream=True`

**Slide 12 — Built-in Tools** (`layout: bento`)
- 4 cards (or 6 if we extend bento to 3-col):
  1. Google Search — `{"type": "google_search"}`
  2. Code Execution — `{"type": "code_execution"}`
  3. URL Context — `{"type": "url_context"}`
  4. Remote MCP — `{"type": "mcp_server", "url": "..."}`
- Callout: "Built-in tools execute server-side, zero code needed"

**Slide 13 — What is an Agent?** (`layout: text`)
- 4 bullet points:
  - The Model (Brain): reasoning engine
  - Tools (Hands & Eyes): interact with environment
  - Context (Workspace): information at each step
  - The Loop (Life): `while` loop — Observe → Think → Act → Repeat
- Code snippet: the agent loop pattern
- Callout: "If you can write a `while` loop, you can build an agent"

---

### Part 4: Live Demo (~10-15 min)

> Switch to terminal/Antigravity. Build a coding agent step by step.

**Demo flow:**
1. Get API key from AI Studio
2. Basic chat — `interactions.create()` with a prompt
3. Add tools — `read_file`, `write_file`, `run_command`
4. The agent loop — `while status == "requires_action"`
5. Test it — ask the agent to read a file and summarize it
6. Show it running end-to-end in Antigravity

---

### Part 5: Closing (2 slides, ~2 min)

**Slide 14 — What We Built** (`layout: text`)
- Recap the journey:
  - Started with `interactions.create()`
  - Added tools for filesystem + shell
  - Built the agent loop
  - Deployed with Antigravity
- Key takeaway: "The entire agent is ~50 lines of Python"

**Slide 15 — Resources & Next Steps** (`layout: bento`)
- 4 resource cards:
  1. Interactions API Docs — ai.google.dev/gemini-api/docs/interactions
  2. AI Studio — aistudio.google.com
  3. Antigravity — antigravity.google
  4. Building Agents Guide — philschmid.de/building-agents
- QR code for workshop repo
- Socials & contact info
