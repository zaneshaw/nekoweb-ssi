import { config } from "../main";
import { parseDirectives } from "../parser";
import type { Directive } from "../types";
import { replaceBetween } from "../utils";
import { join } from "path";

export async function resolveLayoutDirective(directive: Directive) {
	if (directive.args.file) {
		const file = Bun.file(join(config.public_path, directive.args.file));
		return await file.text();
	}

	return undefined;
}

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
	const blockContent = html.substring(directive.endIndex, endDirective.startIndex);

	if (layout) {
		const lDirectives = parseDirectives(layout!);
		for (const lDirective of lDirectives) {
			if (lDirective.type == "block" && lDirective.args.name == directive.args.name) {
				const lEndBlock = getEndBlock(lDirective, lDirectives);
				if (lEndBlock) {
					// todo: find an html parser to use instead. this sucks.
					layout = replaceBetween(layout!, blockContent, lDirective.startIndex, lEndBlock.endIndex);
				}
			}
		}
	}

	const left = html.slice(0, directive.startIndex);
	const middle = html.slice(directive.endIndex, endDirective.startIndex);
	const right = html.slice(endDirective.endIndex);

	return { html: left + middle + right, layout };
}
