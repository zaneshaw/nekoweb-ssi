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

export function resolveBlockDirective(html: string, layout: string | undefined, directive: Directive, endDirective: Directive) {
	const blockContent = html.substring(directive.endIndex, endDirective.startIndex);

	if (layout) {
		const lDirectives = parseDirectives(layout!);
		for (const lDirective of lDirectives) {
			if (lDirective.type == "block" && lDirective.args.name == directive.args.name) {
				const lEndBlock = getEndBlock(lDirective, lDirectives);
				if (lEndBlock) {
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
