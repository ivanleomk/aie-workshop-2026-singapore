import { GoogleGenAI, Interactions } from "@google/genai";
import chalk from "chalk";
import { getUserInput, printRawResponse } from "./lib/console";

const originalWarn = console.warn;
console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Interactions usage is experimental')) return;
    originalWarn(...args);
};

class Agent {
    private client: GoogleGenAI;
    private previousInteractionId: string | undefined = undefined;

    constructor(
        private model: string,
        private tools: Record<string, { definition: Interactions.Tool, function: Function }>,
        private systemInstruction: string = "You are a helpful assistant."
    ) {
        this.client = new GoogleGenAI({});
    }

    async run(currentInput: string | Interactions.Step[] | Interactions.Content[]): Promise<Interactions.Interaction> {
        const response: Interactions.Interaction = await this.client.interactions.create({
            model: this.model,
            input: currentInput,
            tools: Object.values(this.tools).map(t => t.definition),
            system_instruction: this.systemInstruction,
            previous_interaction_id: this.previousInteractionId,
            generation_config: { thinking_level: "medium", thinking_summaries: "auto" }
        });

        // Print the raw API response so students can see thoughts and tool calls
        printRawResponse(response, true);

        // Update interaction ID for the next turn
        this.previousInteractionId = response.id;

        const results: Interactions.Step[] = [];

        for (const step of response.steps || []) {
            if (step.type === "function_call") {
                const funcName = step.name as string;
                const args = step.arguments;

                console.log(chalk.cyan(`\n[Function Call] ${funcName}(${JSON.stringify(args)})`));

                let result;
                if (this.tools[funcName]) {
                    result = await this.tools[funcName].function(args);
                } else {
                    result = "Error: Tool not found";
                }

                console.log(chalk.green(`[Function Response] ${JSON.stringify(result)}`));

                results.push({
                    type: "function_result",
                    name: funcName,
                    call_id: step.id,
                    result: [{ type: "text", text: JSON.stringify(result) }]
                });
            }
        }

        // If there were tool calls, recurse and send results back
        if (results.length > 0) {
            return this.run(results);
        }

        // Return the final response
        return response;
    }
}

async function main() {
    const agentTools = {
        get_weather: {
            definition: {
                type: "function" as const,
                name: "get_weather",
                description: "Get the current weather for a specific location.",
                parameters: { type: "object", properties: { location: { type: "string" } }, required: ["location"] }
            },
            function: (args: Record<string, any>) => {
                return { temperature: 72, condition: "Sunny" };
            }
        }
    };

    const agent = new Agent(
        "gemini-3-flash-preview",
        agentTools,
        `You are a helpful assistant. Today's date is ${new Date().toISOString().split('T')[0]}.`
    );

    console.log(chalk.green("Type 'exit' or 'quit' to close."));

    while (true) {
        const input = await getUserInput();

        if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
            break;
        }

        // Run the agent, which handles all tool calls recursively until finished
        await agent.run([{ type: "text", text: input }]);
    }
}

main().catch(console.error);
