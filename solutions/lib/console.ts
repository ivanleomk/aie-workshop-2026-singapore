import type { Interactions } from "@google/genai";
import chalk from "chalk";
import * as readline from "node:readline/promises";

/**
 * A helper to consistently print API responses cleanly without squishing objects.
 */
export function printRawResponse(response: Interactions.Interaction) {
    console.log(chalk.yellowBright("\n--- RAW API RESPONSE ---"));

    if (response.steps && Array.isArray(response.steps)) {
        // By printing each step individually, we avoid the squished `}, {` array formatting
        response.steps.forEach((step: any, index: number) => {
            console.log(chalk.cyanBright(`\n[Step ${index + 1}: ${step.type}]`));
            // Using compact: false forces Node to put every object property on its own line!
            console.dir(step, { depth: null, colors: true, compact: false });
        });
    } else {
        // Fallback if there are no steps
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
