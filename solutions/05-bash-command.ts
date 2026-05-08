import { GoogleGenAI } from "@google/genai";
import * as readline from "readline";
import * as fs from "fs";
import { execSync } from "child_process";
import chalk from "chalk";

const originalWarn = console.warn;
console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Interactions usage is experimental')) return;
    originalWarn(...args);
};

const toolsMap: Record<string, Function> = {
    read_file: (args: any) => fs.readFileSync(args.file_path, "utf8"),
    write_file: (args: any) => {
        fs.writeFileSync(args.file_path, args.content, "utf8");
        return "File written successfully.";
    },
    run_command: (args: any) => {
        try {
            return execSync(args.command, { encoding: "utf8" });
        } catch (e: any) {
            return e.stdout || e.stderr || e.message;
        }
    }
};

const toolsDefinition = [
    { type: "function", name: "read_file", parameters: { type: "OBJECT", properties: { file_path: { type: "STRING" } }, required: ["file_path"] } },
    { type: "function", name: "write_file", parameters: { type: "OBJECT", properties: { file_path: { type: "STRING" }, content: { type: "STRING" } }, required: ["file_path", "content"] } },
    { type: "function", name: "run_command", parameters: { type: "OBJECT", properties: { command: { type: "STRING" } }, required: ["command"] } }
];

const systemInstruction = "You are an expert software engineer and helpful coding assistant. You have access to the local file system and bash.";

async function main() {
    const client = new GoogleGenAI({});
    let previousInteractionId: string | undefined = undefined;

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const askQuestion = (query: string): Promise<string> => new Promise(resolve => rl.question(query, resolve));

    console.log(chalk.bgGreen.black.bold(" 🤖 Full Bash Agent. Type 'exit' to quit. "));

    while (true) {
        const userInput = await askQuestion(chalk.blueBright.bold("\nUser > "));
        if (userInput.toLowerCase() === 'exit') {
            rl.close();
            break;
        }

        let interaction = await client.interactions.create({
            model: "gemini-3-flash-preview",
            input: userInput,
            previous_interaction_id: previousInteractionId,
            system_instruction: systemInstruction,
            tools: toolsDefinition
        });

        // Inner Loop: Handle tool calls
        while (interaction.status === "requires_action") {
            const results = [];
            for (const output of interaction.outputs || []) {
                if (output.type === "function_call") {
                    console.log(chalk.yellow(`\n[ Running Tool: ${output.name} ]`));
                    const func = toolsMap[output.name];
                    const result = func ? func(output.arguments) : `Error: Tool ${output.name} not found`;
                    console.log(chalk.dim.italic(`  ↳ Result: ${result.toString().substring(0, 100)}...`));

                    results.push({
                        type: "function_result",
                        name: output.name,
                        call_id: output.id,
                        result: { result }
                    });
                }
            }

            interaction = await client.interactions.create({
                model: "gemini-3-flash-preview",
                previous_interaction_id: interaction.id,
                input: results,
                tools: toolsDefinition
            });
        }

        previousInteractionId = interaction.id;

        const textOutput = interaction.outputs?.find(o => o.type === 'text')?.text || "";
        console.log(chalk.greenBright(textOutput));
    }
}

main().catch(console.error);
