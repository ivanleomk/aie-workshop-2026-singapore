import type { Interactions } from "@google/genai";
import chalk from "chalk";

/**
 * A helper to consistently print API responses cleanly without squishing objects.
 */
export function printRawResponse(response: Interactions.Interaction) {
    console.log(chalk.yellowBright("\n--- RAW API RESPONSE ---"));

    if (response.outputs && Array.isArray(response.outputs)) {
        // By printing each step individually, we avoid the squished `}, {` array formatting
        response.outputs.forEach((output: any, index: number) => {
            console.log(chalk.cyanBright(`\n[Step ${index + 1}: ${output.type}]`));
            // Using compact: false forces Node to put every object property on its own line!
            console.dir(output, { depth: null, colors: true, compact: false });
        });
    } else {
        // Fallback if there are no steps
        console.dir(response, { depth: null, colors: true, compact: false });
    }
}
