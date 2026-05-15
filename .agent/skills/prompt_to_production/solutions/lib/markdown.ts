import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';

// Apply the terminal renderer to marked (cast to any to bypass outdated @types/marked-terminal)
marked.use(markedTerminal() as any);

/**
 * Parses a markdown string and returns ANSI-styled terminal text.
 */
export function formatMarkdown(markdown: string): string {
    return marked.parse(markdown) as string;
}
