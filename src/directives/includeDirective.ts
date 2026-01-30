import { join } from "path";
import type { Directive } from "../types";
import { config } from "../main";
import { replaceBetween } from "../utils";

export async function resolveIncludeDirective(html: string, directive: Directive) {
	if (directive.args.file) {
		const file = Bun.file(join(config.public_path, directive.args.file));
		const includeHtml = await file.text();

		const patchedHtml = replaceBetween(html, includeHtml, directive.startIndex, directive.endIndex);

		return patchedHtml;
	}

	return html;
}
