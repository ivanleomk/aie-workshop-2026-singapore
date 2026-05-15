import { GoogleGenAI, Interactions } from "@google/genai";
import chalk from "chalk";
import { getUserInput, printRawResponse } from "./lib/console";
import * as fs from "node:fs";
import { Daytona, Sandbox } from "@daytona/sdk";


class Context {
    public daytona: Daytona;
    public sandbox!: Sandbox;

    constructor() {
        this.daytona = new Daytona();

    }

    async init() {
        console.log(chalk.blue("Initializing Daytona Sandbox..."));
        this.sandbox = await this.daytona.create({ language: 'typescript' });
        console.log(chalk.green(`Sandbox created successfully (ID: ${this.sandbox.id})`));
    }

    async cleanup() {
        console.log(chalk.blue("Cleaning up Daytona Sandbox..."));
        await this.daytona.delete(this.sandbox);
        console.log(chalk.green("✨ Done."));
    }
}
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
        private systemInstruction: string = "You are a helpful coding assistant.",
        private context?: Context
    ) {
        this.client = new GoogleGenAI({});
    }

    async run(currentInput: string | Interactions.Step[] | Interactions.Content[]): Promise<Interactions.Interaction> {
        const activeTools = [
            ...Object.values(this.tools).map(t => t.definition),
            { type: "google_search" as const },
            { type: "url_context" as const }
        ];

        const response: Interactions.Interaction = await this.client.interactions.create({
            model: this.model,
            input: currentInput,
            tools: activeTools,
            system_instruction: this.systemInstruction,
            previous_interaction_id: this.previousInteractionId,
            generation_config: { thinking_level: "medium", thinking_summaries: "auto" }
        });

        // Log the response to a file
        fs.appendFileSync("09-daytona-sdk.log", JSON.stringify(response, null, 2) + "\n\n", "utf-8");

        printRawResponse(response, true);

        // Update interaction ID for the next turn
        this.previousInteractionId = response.id;

        const results: Interactions.Step[] = [];

        for (const step of response.steps || []) {
            if (step.type === "function_call") {
                const funcName = step.name as string;
                const args = step.arguments;

                let result;
                if (this.tools[funcName]) {
                    result = await this.tools[funcName].function(args, this.context);
                } else {
                    result = "Error: Tool not found";
                }

                results.push({
                    type: "function_result",
                    name: funcName,
                    call_id: step.id as string,
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
    const context = new Context();
    await context.init();

    const agentTools = {
        readFile: {
            definition: {
                type: "function" as const,
                name: "readFile",
                description: "Read the contents of a file at the specified path.",
                parameters: {
                    type: "object",
                    properties: { filePath: { type: "string" } },
                    required: ["filePath"]
                }
            },
            function: async (args: { filePath: string }, ctx: Context) => {
                try {
                    const content = await ctx.sandbox.fs.downloadFile(args.filePath);
                    return content.toString("utf-8");
                } catch (err: any) {
                    return `Error reading file: ${err.message}`;
                }
            }
        },
        editFile: {
            definition: {
                type: "function" as const,
                name: "editFile",
                description: "Write content to a file, overwriting its current contents.",
                parameters: {
                    type: "object",
                    properties: {
                        filePath: { type: "string" },
                        content: { type: "string", description: "The content to write into the file" }
                    },
                    required: ["filePath", "content"]
                }
            },
            function: async (args: { filePath: string; content: string }, ctx: Context) => {
                try {
                    await ctx.sandbox.fs.uploadFile(Buffer.from(args.content, "utf-8"), args.filePath);
                    return "File successfully updated.";
                } catch (err: any) {
                    return `Error writing file: ${err.message}`;
                }
            }
        },
        bash: {
            definition: {
                type: "function" as const,
                name: "bash",
                description: "Execute a bash command in the terminal and return its standard output or error.",
                parameters: {
                    type: "object",
                    properties: { command: { type: "string" } },
                    required: ["command"]
                }
            },
            function: async (args: { command: string }, ctx: Context) => {
                try {
                    const response = await ctx.sandbox.process.executeCommand(args.command);
                    if (response.exitCode !== 0) {
                        return `Command failed with exit code ${response.exitCode}\nOutput: ${response.result || ""}`;
                    }
                    return (response.result || "").trim() || "Command executed successfully with no output.";
                } catch (err: any) {
                    return `Command failed: ${err.message}`;
                }
            }
        }
    };

    const agent = new Agent(
        "gemini-3-flash-preview",
        agentTools,
        `You are a highly capable AI coding assistant. You can read files, write files, and execute bash commands to solve the user's task. Today's date is ${new Date().toISOString().split('T')[0]}.`,
        context
    );

    console.log(chalk.green(`Working Directory: ${process.cwd()}`));
    console.log(chalk.green("Google Tools Agent is ready! Type 'exit' or 'quit' to close."));
    console.log(chalk.yellow("Try asking: 'What is the latest news?' or 'Summarize https://en.wikipedia.org/wiki/Artificial_intelligence'\n"));

    while (true) {
        const input = await getUserInput();

        if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
            break;
        }

        // Run the agent
        await agent.run([{ type: "text", text: input }]);
        console.log("\n"); // extra newline for formatting
    }

    await context.cleanup();
}

main().catch(console.error);
