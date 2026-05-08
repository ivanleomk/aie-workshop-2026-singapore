import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs/promises';
import * as readline from 'readline/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);


// 1. Define tools and their implementation
const fileTools: Record<string, any> = {
    read_file: {
        definition: {
            type: 'function' as const,
            name: 'read_file',
            description: 'Reads the content of a file.',
            parameters: {
                type: 'object' as const,
                properties: {
                    path: { type: 'string' as const, description: 'The path to the file to read' }
                },
                required: ['path']
            }
        },
        function: async (args: { path: string }) => {
            try {
                return await fs.readFile(args.path, 'utf8');
            } catch (err: any) {
                return `Error reading file: ${err.message}`;
            }
        }
    },
    bash: {
        definition: {
            type: 'function' as const,
            name: 'bash',
            description: 'Executes a bash command.',
            parameters: {
                type: 'object' as const,
                properties: {
                    command: { type: 'string' as const, description: 'The bash command to execute' }
                },
                required: ['command']
            }
        },
        function: async (args: { command: string }) => {
            try {
                const { stdout, stderr } = await execAsync(args.command);
                return stdout || stderr || 'Command executed successfully with no output.';
            } catch (err: any) {
                return `Error executing command: ${err.message}\nStderr: ${err.stderr || ''}`;
            }
        }
    },
    edit_file: {
        definition: {
            type: 'function' as const,
            name: 'edit_file',
            description: 'Writes content to a file, overwriting it completely.',
            parameters: {
                type: 'object' as const,
                properties: {
                    path: { type: 'string' as const, description: 'The path to the file to edit' },
                    content: { type: 'string' as const, description: 'The new content of the file' }
                },
                required: ['path', 'content']
            }
        },
        function: async (args: { path: string, content: string }) => {
            try {
                await fs.writeFile(args.path, args.content, 'utf8');
                return `Successfully updated ${args.path}`;
            } catch (err: any) {
                return `Error editing file: ${err.message}`;
            }
        }
    }
};

// 2. Define the Agent class
class Agent {
    model: string;
    client: GoogleGenAI;
    last_interaction_id: string | null = null;
    tools: Record<string, any>;
    system_instruction: string;

    constructor(model: string, tools: Record<string, any>, system_instruction: string = "You are a helpful assistant.") {
        this.model = model;
        this.client = new GoogleGenAI({});
        this.tools = tools;
        this.system_instruction = system_instruction;
    }

    async run(contents: any): Promise<any> {
        const toolDefinitions = Object.values(this.tools).map(t => t.definition);

        const response = await this.client.interactions.create({
            model: this.model,
            input: contents,
            system_instruction: this.system_instruction,
            previous_interaction_id: this.last_interaction_id ?? undefined,
            tools: toolDefinitions.length > 0 ? toolDefinitions : undefined,
            generation_config: {
                thinking_level: "low",
                thinking_summaries: "auto"
            }
        });

        this.last_interaction_id = response.id;

        const tool_results = [];
        for (const output of response.outputs || []) {
            switch (output.type) {
                case "thought": {
                    const thoughtText = output.summary?.filter((item: any) => item.type === "text").map((p: any) => p.text).join('');
                    if (thoughtText) console.log(`\n[Thinking]: ${thoughtText.trim()}`);
                    break;
                }
                case "text": {
                    console.log(`\n[Linus]: ${output.text}`);
                    break;
                }
                case "function_call": {
                    const args = output.arguments || (output as any).args;
                    console.log(`\n[Function Call] ${output.name}(${JSON.stringify(args)})`);

                    const result = this.tools[output.name]
                        ? await this.tools[output.name].function(args)
                        : "Error: Tool not found";

                    console.log(`[Function Response] ${String(result).substring(0, 100)}${String(result).length > 100 ? '...' : ''}`);
                    tool_results.push({
                        type: "function_result" as const,
                        call_id: output.id,
                        name: output.name,
                        result: String(result)
                    });
                    break;
                }
            }
        }

        // If there were tool calls, send results back to the model
        if (tool_results.length > 0) {
            return this.run(tool_results);
        }

        return response;
    }
}

// 3. Run the interactive loop
async function main() {
    const agent = new Agent(
        "gemini-3-flash-preview",
        fileTools,
        "You are a helpful Coding Assistant. Respond like you are Linus Torvalds."
    );

    console.log("Agent ready. Ask it to check files in this directory.");

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    while (true) {
        const userInput = await rl.question("You: ");
        if (['exit', 'quit'].includes(userInput.toLowerCase().trim())) {
            break;
        }

        await agent.run(userInput);
    }

    rl.close();
}

main().catch(console.error);
