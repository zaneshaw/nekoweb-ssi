import type { Directive } from "./types";
import { matchBetween, matchBetweenAll } from "./utils";

export function parseDirectives(html: string) {
	let cursor = 0;
	const directives: Directive[] = matchBetweenAll(html, "<!--#", "-->", false).map((directive) => {
		const startIndex = html.indexOf(directive, cursor);
		const content = matchBetween(directive, "<!--#", "-->")[0]!;
		const args: { [key: string]: string } = {};

		for (const arg of content.split(" ").slice(1)) {
			const key = arg.split("=")[0]!;
			const value = arg.split("=")[1]?.slice(1, -1)!;
			args[key] = value;
		}

		cursor = startIndex + directive.length;

		return {
			type: content.split(" ")[0],
			args: args,
			startIndex: startIndex,
			endIndex: startIndex + directive.length,
		} as Directive;
	});

	return directives;
}
