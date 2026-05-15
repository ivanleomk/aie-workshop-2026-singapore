import { GoogleGenAI, Interactions } from "@google/genai";
import chalk from "chalk";
import { getUserInput, printRawResponse } from "./lib/console";
import * as fs from "node:fs";
import { execSync } from "node:child_process";

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
        private systemInstruction: string = "You are a helpful coding assistant."
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

        // Use our console helper to print the thoughts, text, and function calls nicely
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
                    result = await this.tools[funcName].function(args);
                } else {
                    result = "Error: Tool not found";
                }

                // Truncate output for readability if it's too long
                let resultStr = String(result);
                if (resultStr.length > 500) {
                    resultStr = resultStr.substring(0, 500) + "... [truncated]";
                }

                console.log(chalk.green(`[ function_response ]\n${resultStr}`));

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
            function: (args: Record<string, any>) => {
                try {
                    return fs.readFileSync(args.filePath, "utf-8");
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
            function: (args: Record<string, any>) => {
                try {
                    fs.writeFileSync(args.filePath, args.content, "utf-8");
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
            function: (args: Record<string, any>) => {
                try {
                    const output = execSync(args.command, { encoding: "utf-8", timeout: 15000 });
                    return output.trim() || "Command executed successfully with no output.";
                } catch (err: any) {
                    return `Command failed: ${err.message}\nOutput: ${err.stdout?.toString()}`;
                }
            }
        }
    };

    const agent = new Agent(
        "gemini-3-flash-preview",
        agentTools,
        `You are a highly capable AI coding assistant. You can read files, write files, and execute bash commands to solve the user's task. Today's date is ${new Date().toISOString().split('T')[0]}.`
    );

    console.log(chalk.green(`Working Directory: ${process.cwd()}`));
    console.log(chalk.green("Type 'exit' or 'quit' to close."));
    console.log(chalk.yellow("Try asking: 'Can you list my files in the current directory?'\n"));

    while (true) {
        const input = await getUserInput("User > ");

        if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
            break;
        }

        // Run the agent
        await agent.run([{ type: "text", text: input }]);
        console.log("\n"); // extra newline for formatting
    }
}

main().catch(console.error);
