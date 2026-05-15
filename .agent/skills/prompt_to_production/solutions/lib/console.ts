import type { Interactions } from "@google/genai";
import chalk from "chalk";
import * as readline from "node:readline/promises";

/**
 * A helper to consistently print API responses cleanly without squishing objects.
 */
export function printRawResponse(response: Interactions.Interaction, prettify: boolean = false) {
    console.log(chalk.yellowBright("\n--- RAW API RESPONSE ---"));

    if (prettify && response.steps) {
        response.steps.forEach((step: any) => {
            if (step.type === "thought") {
                const text = step.summary?.[0]?.text;
                if (text) {
                    console.log(chalk.gray(`\n[thought]\n${text.trim()}`));
                } else {
                    console.log(chalk.gray(`\n[thought] ...`));
                }
            } else if (step.type === "model_output" || step.type === "text") {
                const text = step.content?.[0]?.text || step.text;
                if (text) {
                    console.log(chalk.greenBright(`\n[model_output]\n* ${text.trim()}`));
                }
            } else if (step.type === "function_call") {
                console.log(chalk.magenta(`\n[function_call] ${step.name}(${JSON.stringify(step.arguments)})`));
            } else if (step.type === "google_search_call") {
                const queries = step.arguments?.queries || [];
                console.log(chalk.magenta(`\n[google_search_call] Queries: ${JSON.stringify(queries)}`));
            } else if (step.type === "google_search_result") {
                console.log(chalk.gray(`\n[google_search_result] ... (results hidden for brevity)`));
            } else {
                console.log(chalk.cyanBright(`\n[${step.type}]`));
                console.dir(step, { depth: null, colors: true, compact: false });
            }
        });
    } else {
        console.dir(response, { depth: null, colors: true, compact: false });
    }
}

/**
 * A helper to read interactive input from the user.
 */
export async function getUserInput(prompt: string = "User > "): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const answer = await rl.question(chalk.blueBright(prompt));
    rl.close();
    return answer;
}
