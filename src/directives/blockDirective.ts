import { parseDirectives } from "../parser";
import type { Directive } from "../types";
import { replaceBetween } from "../utils";

export function getEndBlock(startBlock: Directive, directives: Directive[]) {
	let level = 0;

	for (const directive of directives) {
		if (directive.startIndex > startBlock.endIndex) {
			if (directive.type == "block") {
				level++;
			} else if (directive.type == "endblock") {
				level--;

				if (level == -1) {
					return directive;
				}
			}
		}
	}

	return null;
}

// todo: rewrite
export function resolveBlockDirective(html: string, layout: string | undefined, directive: Directive, endDirective: Directive) {
	const blockContent = html.substring(directive.endIndex + 1, endDirective.startIndex - 1);

	if (layout) {
		const lDirectives = parseDirectives(layout!);
		for (const lDirective of lDirectives) {
			if (lDirective.type == "block" && lDirective.args.name == directive.args.name) {
				const lEndBlock = getEndBlock(lDirective, lDirectives);
				if (lEndBlock) {
					// todo: find an html parser to use instead. this sucks.
					layout = replaceBetween(layout!, "", lDirective.startIndex - 1, lEndBlock.endIndex);
					layout = `${layout.slice(0, lDirective.startIndex - 1).trimEnd()}\n${blockContent
						.split("\n")
						.map((line) => `\t${line}`)
						.join("\n")}\n${layout.slice(lDirective.startIndex)}`;
				}
			}
		}
	}

	const left = html.slice(0, directive.startIndex);
	const middle = html.slice(directive.endIndex, endDirective.startIndex);
	const right = html.slice(endDirective.endIndex);

	return { html: left + middle + right, layout };
}
